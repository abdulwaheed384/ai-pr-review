// Word version of the PROM06 speaker script (A4, one slide per page, UK English proofing).
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Header, Footer, PageNumber, LevelFormat,
} = require('/opt/npm-tools/node_modules/docx');
const { slides, totalWords, totalTime, WPM, approxWords, approxMinutes } = require('./script_data.js');

const OUT = process.argv[2] || path.join(__dirname, 'PROM06_Speaker_Script.docx');
const NAVY = '08233E', STEEL = '156082', FLAME = 'C73D1A', GREY = '5B6670', TINT = 'EEF2F6', LINE = 'D3DAE2';
const BODY = 'Arial', HEAD = 'Cambria';
const CONTENT_W = 11906 - 2 * 1134; // A4 width minus 2 cm margins, in DXA

const p = (children, opts = {}) => new Paragraph({ children, ...opts });
const t = (text, opts = {}) => new TextRun({ text, ...opts });

// ---------- cover and run sheet ----------
const cover = [
  p([t('PROM06 RESEARCH PROJECT · RECORDED PRESENTATION', { bold: true, color: FLAME, size: 20, characterSpacing: 20 })], { spacing: { after: 120 } }),
  p([t('Speaker Script')], { heading: HeadingLevel.TITLE }),
  p([t('Evaluating AI-Driven Security Review in Modern DevSecOps Pipelines', { size: 28, color: NAVY })], { spacing: { after: 80 } }),
  p([t('Abdul Waheed · Student number 209333039 · MSc Computer Science with Cybersecurity', { size: 22, color: GREY })], { spacing: { after: 360 } }),
  p([t('How to use this script')], { heading: HeadingLevel.HEADING_2 }),
  ...[
    `It is about ${approxWords} words and takes about ${approxMinutes} minutes at a steady pace (${WPM} words a minute). The brief allows 10 to 15 minutes.`,
    'Each slide starts on a new page. The line above each heading gives the time for that slide and the running total.',
    'Text in a grey box is a note for you, not something to say.',
    'The same script is in the speaker notes of the PowerPoint file, so it shows on screen while you record.',
  ].map((s) => p([t(s)], { numbering: { reference: 'bullets', level: 0 }, spacing: { after: 80 } })),
  p([t('Run sheet')], { heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } }),
];

const COLS = [900, CONTENT_W - 900 - 1250 - 1500, 1250, 1500];
const cellBorders = { top: { style: BorderStyle.SINGLE, size: 4, color: LINE }, left: { style: BorderStyle.SINGLE, size: 4, color: LINE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE }, right: { style: BorderStyle.SINGLE, size: 4, color: LINE } };
const cell = (text, i, opts = {}) => new TableCell({
  width: { size: COLS[i], type: WidthType.DXA },
  borders: cellBorders,
  shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [p([t(text, { bold: !!opts.bold, color: opts.color, size: 21 })], { alignment: i >= 2 ? AlignmentType.RIGHT : AlignmentType.LEFT })],
});
const runSheet = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: COLS,
  rows: [
    new TableRow({ tableHeader: true, children: ['Slide', 'Title', 'Time', 'Running total'].map((h, i) => cell(h, i, { bold: true, color: 'FFFFFF', fill: NAVY })) }),
    ...slides.map((s, k) => new TableRow({ children: [String(s.n), s.title, s.time, s.total].map((v, i) => cell(v, i, { fill: k % 2 ? TINT : undefined })) })),
  ],
});

// ---------- one page per slide ----------
const slidePages = [];
slides.forEach((s) => {
  slidePages.push(p([t(`SLIDE ${s.n} OF ${slides.length}`, { bold: true, color: FLAME, characterSpacing: 20 }), t(`   ·   about ${s.time}   ·   ${s.total} in total`, { color: GREY })],
    { pageBreakBefore: true, spacing: { after: 60 } }));
  slidePages.push(p([t(s.title)], { heading: HeadingLevel.HEADING_1 }));
  s.paras.forEach((para) => {
    if (para.note) {
      const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      slidePages.push(new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [CONTENT_W],
        rows: [new TableRow({ children: [new TableCell({
          width: { size: CONTENT_W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: TINT },
          borders: { top: noBorder, left: noBorder, bottom: noBorder, right: noBorder },
          margins: { top: 140, bottom: 140, left: 200, right: 200 },
          children: [p([t(para.note + ' (Not part of the spoken script.)', { italics: true, color: GREY, size: 24 })], { spacing: { after: 0 } })],
        })] })],
      }));
      slidePages.push(p([], { spacing: { after: 120 } }));
    } else {
      slidePages.push(p([t(para.text)], { style: 'Script' }));
    }
  });
});

// ---------- recording steps ----------
const steps = [
  'Slide Show > Rehearse Timings: read the script once and check the total is between 10 and 15 minutes.',
  'Record > From Beginning (on a Mac: Slide Show > Record Slide Show). Your notes appear at the top of the recording window.',
  'File > Export > Create a Video > Full HD (1080p) > Use Recorded Timings and Narrations > Create Video, and save it as MP4.',
  'Play the MP4 on a Windows PC to check the sound and the length, then upload it to the Canvas presentation link.',
];
const recording = [
  p([t('Recording in PowerPoint')], { heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
  ...steps.map((s) => p([t(s)], { numbering: { reference: 'steps', level: 0 }, spacing: { after: 120 } })),
  p([t('If a practice run goes over 14 minutes, leave out the optional demo on slide 4. If it is under 11 minutes, slow down a little.', { color: GREY })], { spacing: { before: 200 } }),
];

const doc = new Document({
  creator: 'Abdul Waheed',
  title: 'PROM06 Speaker Script',
  description: 'Slide-by-slide speaker script for the PROM06 recorded presentation',
  styles: {
    default: {
      document: { run: { font: BODY, size: 22, language: { value: 'en-GB' } }, paragraph: { spacing: { after: 120 } } },
      title: { run: { font: HEAD, size: 56, bold: true, color: NAVY }, paragraph: { spacing: { after: 120 } } },
      heading1: { run: { font: HEAD, size: 36, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 240 } } },
      heading2: { run: { font: HEAD, size: 28, bold: true, color: NAVY }, paragraph: { spacing: { before: 240, after: 120 } } },
    },
    paragraphStyles: [
      { id: 'Script', name: 'Script', basedOn: 'Normal', next: 'Script', quickFormat: true,
        run: { font: BODY, size: 28, color: '1A1F26' }, paragraph: { spacing: { after: 220, line: 360 } } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 567, footer: 567 } } },
    headers: { default: new Header({ children: [p([t('PROM06 speaker script · Abdul Waheed', { size: 18, color: GREY })], { alignment: AlignmentType.RIGHT })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Page ', size: 18, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY }), new TextRun({ text: ' of ', size: 18, color: GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GREY })] })] }) },
    children: [...cover, runSheet, ...slidePages, ...recording],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log('Wrote', OUT); });
