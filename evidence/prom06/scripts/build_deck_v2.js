// PROM06 recorded presentation — Abdul Waheed (209333039)
// Version 2 design: fewer words, more visuals, simple language. Same theme, layouts, sections and facts.
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");

const SKILL = "/root/.claude/skills/synced/cf0d7e50-8ae6-43ed-88bb-6aa4d7cd8ece_6a9848f8-e8b6-4a18-80e9-e09e49605f83/pptx";
const { applyTheme } = require(SKILL + "/scripts/apply_theme.js");
const HERE = __dirname;
const OUT = process.argv[2] || path.join(HERE, "PROM06_Presentation_AbdulWaheed_209333039.pptx");
const NOTES = require(path.join(HERE, "notes.js"));

const THEME = {
  name: "Sunderland Research",
  headFontFace: "Cambria",
  bodyFontFace: "Arial",
  colors: {
    dk1: "1A1F26", lt1: "FFFFFF", dk2: "08233E", lt2: "EEF2F6",
    accent1: "C73D1A", accent2: "156082", accent3: "6C93B8",
    accent4: "2E7D4F", accent5: "B7791F", accent6: "7A8794",
    hlink: "156082", folHlink: "6C93B8",
  },
};
const H = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Abdul Waheed";
pres.company = "University of Sunderland";
pres.subject = "PROM06 Research Project: recorded presentation";
pres.title = "Evaluating AI-Driven Security Review in Modern DevSecOps Pipelines";
const C = pres.SchemeColor;
const LANG = "en-GB";
const MONO = "Courier New";
const L = 0.6, R = 12.733, CW = R - L;
const LINE = "D3DAE2";

// ---------- icons ----------
const ICONS = {};
async function icon(name, hex) {
  const key = name + "_" + hex;
  if (ICONS[key]) return;
  const Comp = fa[name];
  if (!Comp) throw new Error("Missing icon " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: "512" }));
  const buf = await sharp(Buffer.from(svg)).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  ICONS[key] = "image/png;base64," + buf.toString("base64");
}
const W = "FFFFFF";
const NEEDED = [
  ["FaCodePullRequest", "08233E"], ["FaListCheck", W], ["FaShieldHalved", W], ["FaRobot", W], ["FaCodePullRequest", W],
  ["FaCode", W], ["FaClone", W], ["FaUserShield", W], ["FaArrowRight", "7A8794"], ["FaArrowRight", W],
  ["FaCheck", "2E7D4F"], ["FaXmark", "C73D1A"], ["FaCheck", W], ["FaXmark", W],
  ["FaMagnifyingGlass", W], ["FaWrench", W], ["FaLightbulb", W], ["FaTriangleExclamation", W],
  ["FaBookOpen", W], ["FaBullseye", W], ["FaCircleCheck", W], ["FaCommentDots", W], ["FaScaleBalanced", W],
  ["FaFileCode", W], ["FaRepeat", W], ["FaClipboardCheck", W], ["FaNetworkWired", W], ["FaLock", W], ["FaFileLines", W],
  ["FaKey", W], ["FaIdBadge", W], ["FaFingerprint", W], ["FaCodeCompare", W], ["FaRotate", W],
  ["FaShuffle", W], ["FaEyeSlash", W], ["FaStopwatch", W], ["FaUserCheck", W], ["FaFlaskVial", W],
  ["FaLayerGroup", W], ["FaCommentSlash", W], ["FaEye", W], ["FaVial", W], ["FaTrashCan", W], ["FaTags", W], ["FaPlus", "7A8794"],
  ["FaGears", W], ["FaCodeCommit", W], ["FaBan", W], ["FaLink", W], ["FaArrowRight", "6C93B8"],
];

// ---------- helpers ----------
function nb(t) { // keep citations, PR numbers and page ranges together on one line
  if (typeof t !== "string") return t;
  return t.replace(/ et al\.,? /g, (m) => m.replace(/ /g, " ")).replace(/\(([A-Z][A-Za-z’']+), (\d{4})/g, "($1, $2")
    .replace(/PR #/g, "PR #").replace(/pp\. /g, "pp. ").replace(/RFC 5737/g, "RFC 5737");
}
function txt(slide, text, o) {
  const body = Array.isArray(text) ? text.map((r) => ({ text: nb(r.text), options: r.options })) : nb(text);
  slide.addText(body, Object.assign({ isTextBox: true, lang: LANG, margin: 0, fontSize: 14, color: C.text1, valign: "top", fit: "none" }, o));
}
function run(text, o) { return { text, options: Object.assign({ lang: LANG }, o || {}) }; }
function box(slide, x, y, w, h, o) {
  o = o || {};
  const opts = {
    x, y, w, h, rectRadius: o.radius === undefined ? 0.08 : o.radius,
    fill: Object.assign({ color: o.fill || C.background2 }, o.transparency !== undefined ? { transparency: o.transparency } : {}),
    line: o.line ? { color: o.line, width: o.lineW || 1 }
      : Object.assign({ color: o.fill || C.background2, width: 0 }, o.transparency !== undefined ? { transparency: 100 } : {}),
    objectName: o.name || "Card",
  };
  if (o.shadow) opts.shadow = { type: "outer", color: "000000", blur: 7, offset: 2, angle: 90, opacity: 0.13 };
  slide.addShape(o.square ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE, opts);
}
function circleIcon(slide, name, iconHex, x, y, d, fill, o) {
  o = o || {};
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: d, h: d, fill: { color: fill },
    line: o.ring ? { color: o.ring, width: o.ringW || 1.5 } : { color: fill, width: 0 },
    objectName: (o.name || name) + " circle",
  });
  const p = d * (o.pad || 0.25);
  slide.addImage({ data: ICONS[name + "_" + iconHex], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: (o.name || name) + " icon" });
}
function glyph(slide, name, hex, x, y, d, nm) { slide.addImage({ data: ICONS[name + "_" + hex], x, y, w: d, h: d, objectName: nm || name }); }
function vline(slide, x, y1, y2, arrow, name) {
  slide.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2 - y1, line: Object.assign({ color: H.accent6, width: 1.5 }, arrow ? { endArrowType: "triangle" } : {}), objectName: name || "Connector" });
}
function hline(slide, x1, x2, y, name) {
  slide.addShape(pres.shapes.LINE, { x: x1, y, w: x2 - x1, h: 0, line: { color: H.accent6, width: 1.5 }, objectName: name || "Connector" });
}
function label(slide, text, x, y, w, color) {
  txt(slide, text.toUpperCase(), { x, y, w, h: 0.28, fontSize: 12, bold: true, color: color || C.accent1, charSpacing: 1.5, objectName: "Label " + text });
}
function title(slide, t) { slide.addText(t, { placeholder: "title", lang: LANG }); }

// ---------- layouts ----------
const LOGO = path.join(HERE, "uos_logo.png"); // 565 x 264 px
pres.defineSlideMaster({
  title: "TITLE_NAVY",
  background: { color: H.dk2 },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } } },
    { rect: { x: L, y: 0.55, w: 2.75, h: 1.2, fill: { color: C.background1 }, line: { color: C.background1, width: 0 } } },
    { image: { path: LOGO, x: L + 0.17, y: 0.6, w: 2.4, h: 1.12 } },
    { placeholder: { options: { name: "title", type: "title", x: L, y: 2.05, w: CW, h: 1.45, fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left", margin: 0, lang: LANG }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: L, y: 3.62, w: CW, h: 0.5, fontSize: 20, color: C.background2, valign: "top", align: "left", margin: 0, lang: LANG }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: H.lt1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  slideNumber: { x: 11.05, y: 6.98, w: 0.6, h: 0.3, fontSize: 10, color: H.accent6, align: "right" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: L, y: 0.42, w: CW, h: 0.72, fontSize: 36, bold: true, color: C.text2, valign: "top", align: "left", margin: 0, lang: LANG }, text: "" } },
    { text: { text: "Abdul Waheed · PROM06 Research Project · University of Sunderland", options: { x: L, y: 6.98, w: 7.5, h: 0.3, fontSize: 10, color: C.accent6, margin: 0, valign: "middle", lang: LANG } } },
    { image: { path: LOGO, x: R - 0.79, y: 6.92, w: 0.79, h: 0.37 } },
  ],
});

async function build() {
  for (const [n, h] of NEEDED) await icon(n, h);

  // ===== 1 Title (unchanged design) =====
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "TITLE_NAVY", sectionTitle: "Introduction" });
  s.addText("Evaluating AI-Driven Security Review\nin Modern DevSecOps Pipelines", { placeholder: "title", lang: LANG });
  s.addText("An empirical comparison of an AI reviewer with Checkov and tfsec for Terraform pull requests", { placeholder: "body", lang: LANG });
  txt(s, [
    run("Abdul Waheed", { bold: true, fontSize: 18, color: C.background1, breakLine: true }),
    run("Student number 209333039", { breakLine: true }),
    run("MSc Computer Science with Cybersecurity · PROM06 Research Project", { breakLine: true }),
    run("Supervisor: Liz Gandy", { breakLine: true }),
    run("Faculty of Technology · School of Computer Science · October 2026"),
  ], { x: L, y: 4.55, w: 7.6, h: 1.9, fontSize: 14, color: C.background2, paraSpaceAfter: 4, objectName: "Presenter details" });
  const cxs = [9.75, 11.0, 12.25], d1 = 0.8, prY = 4.45, revY = 5.6;
  circleIcon(s, "FaCodePullRequest", "08233E", 11.0 - d1 / 2, prY, d1, C.background1, { name: "Pull request", pad: 0.24 });
  s.addShape(pres.shapes.LINE, { x: cxs[0], y: prY + d1, w: 11.0 - cxs[0], h: revY - prY - d1, flipH: true, line: { color: C.accent3, width: 1.25 }, objectName: "Connector left" });
  s.addShape(pres.shapes.LINE, { x: 11.0, y: prY + d1, w: 0, h: revY - prY - d1, line: { color: C.accent3, width: 1.25 }, objectName: "Connector middle" });
  s.addShape(pres.shapes.LINE, { x: 11.0, y: prY + d1, w: cxs[2] - 11.0, h: revY - prY - d1, line: { color: C.accent3, width: 1.25 }, objectName: "Connector right" });
  [["Checkov", "FaListCheck", C.accent3], ["tfsec", "FaShieldHalved", C.accent3], ["AI reviewer", "FaRobot", C.accent1]].forEach(([nm, ic, fill], i) => {
    circleIcon(s, ic, W, cxs[i] - d1 / 2, revY, d1, fill, { name: nm, ring: C.background1, ringW: 1.5 });
    txt(s, nm, { x: cxs[i] - 0.62, y: revY + d1 + 0.08, w: 1.24, h: 0.3, fontSize: 13, color: C.background1, align: "center", objectName: nm + " label" });
  });
  s.addNotes(NOTES[0]);

  // ===== 2 Problem, aim, questions, objectives =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  title(s, "Can an AI reviewer catch what scanners miss?");
  label(s, "The problem", L, 1.45, 6);
  const steps2 = [
    ["FaCode", C.accent2, "Infrastructure is written as code", "(Morris, 2020)"],
    ["FaClone", C.accent2, "One unsafe line is copied everywhere", ""],
    ["FaUserShield", C.accent2, "Keeping it safe is the customer’s job", "(Microsoft, 2024)"],
  ];
  steps2.forEach(([ic, fill, cap, cite], i) => {
    const x = L + i * 2.2;
    circleIcon(s, ic, W, x + (1.9 - 0.72) / 2, 1.82, 0.72, fill, { name: "Problem " + (i + 1) });
    txt(s, [run(cap, { bold: true, color: C.text2, breakLine: !!cite }), ...(cite ? [run(cite, { fontSize: 11, color: C.accent6 })] : [])],
      { x, y: 2.62, w: 1.9, h: 0.85, fontSize: 14, align: "center", objectName: "Problem caption " + (i + 1) });
    if (i < 2) glyph(s, "FaArrowRight", "7A8794", x + 1.95, 2.0, 0.28, "Problem arrow " + (i + 1));
  });
  label(s, "Two ways to check it", L, 3.62, 6);
  const sides = [
    ["Scanners", "Checkov, tfsec", "FaListCheck", C.accent2, [["ok", "Fast and consistent"], ["no", "Only know their own rules"], ["no", "Noisy warnings get ignored"]], "Johnson et al., 2013"],
    ["AI reviewer", "Claude", "FaRobot", C.accent1, [["ok", "Reads all the code"], ["ok", "Explains in plain English"], ["no", "Can be wrong, or change its answer"]], "Ji et al., 2023; Ouyang et al., 2025"],
  ];
  sides.forEach(([head, sub, ic, fill, pts, cite], i) => {
    const x = L + i * 3.2, y = 3.95, w = 3.0, h = 2.65;
    box(s, x, y, w, h, { fill: C.background2, name: head + " card" });
    circleIcon(s, ic, W, x + 0.2, y + 0.2, 0.52, fill, { name: head });
    txt(s, [run(head, { bold: true, fontSize: 16, color: C.text2, breakLine: true }), run(sub, { fontSize: 12, color: C.accent6 })],
      { x: x + 0.85, y: y + 0.18, w: w - 1.0, h: 0.6, objectName: head + " heading" });
    pts.forEach(([kind, t], j) => {
      const yy = y + 0.9 + j * 0.4;
      glyph(s, kind === "ok" ? "FaCheck" : "FaXmark", kind === "ok" ? "2E7D4F" : "C73D1A", x + 0.22, yy + 0.04, 0.2, head + " mark " + (j + 1));
      txt(s, t, { x: x + 0.55, y: yy, w: w - 0.7, h: 0.4, fontSize: 13, objectName: head + " point " + (j + 1) });
    });
    txt(s, "(" + cite + ")", { x: x + 0.22, y: y + h - 0.34, w: w - 0.4, h: 0.26, fontSize: 10, color: C.accent6, objectName: head + " citation" });
  });
  const rx2 = 7.2, rw2 = R - rx2;
  box(s, rx2, 1.45, rw2, 5.15, { fill: C.background2, name: "Aim card" });
  label(s, "My aim", rx2 + 0.3, 1.62, 3);
  txt(s, "Find out how well an AI security reviewer works in a DevSecOps pipeline, compared with Checkov and tfsec.",
    { x: rx2 + 0.3, y: 1.92, w: rw2 - 0.6, h: 0.6, fontSize: 14, objectName: "Aim" });
  label(s, "Four questions", rx2 + 0.3, 2.75, 4);
  const rqs = [
    ["RQ1", "Does it find the problems?", "FaMagnifyingGlass"],
    ["RQ2", "Do its fixes work?", "FaWrench"],
    ["RQ3", "Do its comments help understanding?", "FaLightbulb"],
    ["RQ4", "What goes wrong in real use?", "FaTriangleExclamation"],
  ];
  rqs.forEach(([k, q, ic], i) => {
    const y = 3.07 + i * 0.5;
    circleIcon(s, ic, W, rx2 + 0.3, y, 0.4, C.accent1, { name: k });
    txt(s, [run(k + "  ", { bold: true, color: C.accent1 }), run(q, { color: C.text1 })], { x: rx2 + 0.85, y, w: rw2 - 1.1, h: 0.4, fontSize: 15, valign: "middle", objectName: k + " question" });
  });
  label(s, "Objectives", rx2 + 0.3, 5.15, 4);
  const objs2 = ["Review the research", "Build the pipeline", "Compare with scanners", "Find benefits and limits"];
  const cw2 = (rw2 - 0.6 - 0.15) / 2;
  objs2.forEach((o, i) => {
    const x = rx2 + 0.3 + (i % 2) * (cw2 + 0.15), y = 5.45 + Math.floor(i / 2) * 0.5;
    box(s, x, y, cw2, 0.4, { fill: C.background1, line: LINE, lineW: 0.75, radius: 0.2, name: "Objective " + (i + 1) });
    txt(s, [run("O" + (i + 1) + "  ", { bold: true, color: C.accent2 }), run(o)], { x: x + 0.14, y, w: cw2 - 0.2, h: 0.4, fontSize: 12.5, valign: "middle", objectName: "Objective text " + (i + 1) });
  });
  s.addNotes(NOTES[1]);

  // ===== 3 Literature =====
  pres.addSection({ title: "Research context" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Research context" });
  title(s, "How the literature shaped the study");
  label(s, "What the research says", L, 1.45, 5.6);
  label(s, "What I did", 7.0, 1.45, 5.6, C.accent2);
  const lit = [
    ["Noisy, unclear warnings get ignored", "Johnson et al., 2013", "Counted false alarms and scored explanations"],
    ["The same security mistakes keep appearing", "Rahman et al., 2019", "Used these mistakes in my tests"],
    ["Some tools feed scanner results to the AI", "Li et al., 2024", "Kept the AI separate from the scanners"],
    ["AI can give a different answer each time", "Ouyang et al., 2025", "Ran every test three times"],
    ["AI claims and fixes can be wrong", "Ji et al., 2023; Pearce et al., 2023", "Tried every AI fix, then re-tested it"],
  ];
  lit.forEach(([find, cite, did], i) => {
    const y = 1.82 + i * 0.7, h = 0.58;
    box(s, L, y, 5.6, h, { fill: C.background2, radius: 0.12, name: "Finding " + (i + 1) });
    txt(s, [run(find, { bold: true, color: C.text2, breakLine: true }), run("(" + cite + ")", { fontSize: 11, color: C.accent6 })],
      { x: L + 0.2, y, w: 5.25, h, fontSize: 14, valign: "middle", objectName: "Finding text " + (i + 1) });
    circleIcon(s, "FaArrowRight", W, 6.39, y + (h - 0.4) / 2, 0.4, C.accent1, { name: "Link " + (i + 1), pad: 0.27 });
    box(s, 7.0, y, R - 7.0, h, { fill: C.accent2, radius: 0.12, name: "Action " + (i + 1) });
    txt(s, did, { x: 7.2, y, w: R - 7.4, h, fontSize: 15, bold: true, color: C.background1, valign: "middle", objectName: "Action text " + (i + 1) });
  });
  const by3 = 5.45, bh3 = 1.15, bw3 = (CW - 0.3) / 2;
  box(s, L, by3, bw3, bh3, { fill: C.background2, name: "Explain card" });
  circleIcon(s, "FaBookOpen", W, L + 0.22, by3 + 0.28, 0.55, C.accent2, { name: "Explain" });
  txt(s, [run("Also used to explain my results", { bold: true, color: C.text2, breakLine: true }),
    run("Text can steer an AI (Greshake et al., 2023); test sets can flatter AI (Ding et al., 2025)", { fontSize: 13 })],
    { x: L + 0.95, y: by3 + 0.16, w: bw3 - 1.1, h: bh3 - 0.25, fontSize: 15, paraSpaceAfter: 3, valign: "middle", objectName: "Explain text" });
  const gx3 = L + bw3 + 0.3;
  box(s, gx3, by3, bw3, bh3, { fill: C.text2, name: "Gap card" });
  circleIcon(s, "FaBullseye", W, gx3 + 0.22, by3 + 0.28, 0.55, C.accent1, { name: "Gap" });
  txt(s, [run("The gap", { bold: true, color: C.background1, breakLine: true }),
    run("Very few fair, side-by-side tests of an AI reviewer against IaC scanners", { fontSize: 13, color: C.background1 })],
    { x: gx3 + 0.95, y: by3 + 0.16, w: bw3 - 1.1, h: bh3 - 0.25, fontSize: 15, paraSpaceAfter: 3, valign: "middle", objectName: "Gap text" });
  s.addNotes(NOTES[2]);

  // ===== 4 What I built =====
  pres.addSection({ title: "Practical work" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Practical work" });
  title(s, "What I built: three independent reviewers");
  const fx = L, fw = 6.3, mid = fx + fw / 2;
  const step = (y, h, text, name, ic) => {
    box(s, fx, y, fw, h, { fill: C.background2, name });
    circleIcon(s, ic, W, fx + 0.14, y + (h - 0.42) / 2, 0.42, C.text2, { name: name + " icon" });
    txt(s, text, { x: fx + 0.7, y, w: fw - 0.85, h, fontSize: 15, valign: "middle", objectName: name + " text" });
  };
  step(1.45, 0.5, [run("A pull request is opened", { bold: true })], "Step PR", "FaCodePullRequest");
  vline(s, mid, 1.95, 2.15, true, "Arrow to check");
  step(2.15, 0.5, [run("Code checked ", { bold: true }), run("(nothing is deployed)")], "Step check", "FaCircleCheck");
  const tw = (fw - 0.4) / 3, tY = 2.95, tH = 1.75;
  const tcx = [0, 1, 2].map((i) => fx + i * (tw + 0.2) + tw / 2);
  vline(s, mid, 2.65, 2.8, false, "Fan-out stem");
  hline(s, tcx[0], tcx[2], 2.8, "Fan-out bar");
  tcx.forEach((x, i) => vline(s, x, 2.8, tY, true, "Fan-out arrow " + (i + 1)));
  [["Checkov", "version 3.3.1", "fixed rules", C.accent2, "FaListCheck"],
   ["tfsec", "version 1.28.14", "fixed rules", C.accent2, "FaShieldHalved"],
   ["AI reviewer", "Claude", "reads all the code", C.accent1, "FaRobot"]].forEach(([nm, ver, what, fill, ic], i) => {
    const x = fx + i * (tw + 0.2);
    box(s, x, tY, tw, tH, { fill: C.background1, line: fill, lineW: 1.5, name: nm + " box" });
    circleIcon(s, ic, W, x + (tw - 0.62) / 2, tY + 0.14, 0.62, fill, { name: nm });
    txt(s, [run(nm, { bold: true, fontSize: 16, color: C.text2, breakLine: true }), run(what, { fontSize: 13, breakLine: true }), run(ver, { fontSize: 11, color: C.accent6 })],
      { x: x + 0.1, y: tY + 0.85, w: tw - 0.2, h: tH - 0.9, align: "center", paraSpaceAfter: 1, objectName: nm + " text" });
  });
  const fanInY = tY + tH + 0.15;
  tcx.forEach((x, i) => vline(s, x, tY + tH, fanInY, false, "Fan-in stem " + (i + 1)));
  hline(s, tcx[0], tcx[2], fanInY, "Fan-in bar");
  vline(s, mid, fanInY, fanInY + 0.15, true, "Arrow to comments");
  const cY = fanInY + 0.15;
  step(cY, 0.5, [run("Each tool posts its own comment", { bold: true })], "Step comments", "FaCommentDots");
  vline(s, mid, cY + 0.5, cY + 0.7, true, "Arrow to compare");
  step(cY + 0.7, 0.5, [run("I compare them with the correct answers", { bold: true })], "Step compare", "FaScaleBalanced");
  const ex = 7.3, ew = R - ex;
  txt(s, [run("Real result: pull request #71", { bold: true, color: C.text2, fontSize: 17, breakLine: true }),
    run("SSH (remote login) left open to the whole internet", { fontSize: 13, color: C.accent6 })],
    { x: ex, y: 1.45, w: ew, h: 0.65, objectName: "Evidence heading" });
  const ev = [
    ["Checkov", false, "Passed: 7 · Failed: 0 · Skipped: 0", "Missed it"],
    ["tfsec", true, "CRITICAL · AVD-AZU-0047 — Security group rule allows ingress from public internet.", "Found it"],
    ["AI reviewer", true, "HIGH · SECURITY_VULNERABILITY · Unrestricted inbound SSH access permitted from any source address", "Found it, and explained the fix"],
  ];
  let ey = 2.25;
  ev.forEach(([nm, ok, quote, verdict], i) => {
    const h = [1.0, 1.2, 1.4][i];
    box(s, ex, ey, ew, h, { fill: C.background1, line: LINE, lineW: 1, shadow: true, name: nm + " result card" });
    circleIcon(s, ok ? "FaCheck" : "FaXmark", W, ex + 0.2, ey + 0.2, 0.56, ok ? C.accent4 : C.accent6, { name: nm + " status", pad: 0.27 });
    txt(s, [run(nm + "  ", { bold: true, color: C.text2 }), run(verdict, { bold: true, color: ok ? C.accent4 : C.accent6 })],
      { x: ex + 0.95, y: ey + 0.16, w: ew - 1.1, h: 0.35, fontSize: 15, objectName: nm + " verdict" });
    txt(s, quote, { x: ex + 0.95, y: ey + 0.55, w: ew - 1.15, h: h - 0.6, fontSize: 11, fontFace: MONO, objectName: nm + " output" });
    ey += h + 0.15;
  });
  txt(s, "Copied word for word from the first run · Dissertation Figure 4.2 · github.com/abdulwaheed384/ai-pr-review",
    { x: ex, y: ey + 0.02, w: ew, h: 0.45, fontSize: 11, color: C.accent6, objectName: "Evidence source" });
  s.addNotes(NOTES[3]);

  // ===== 5 How I tested it =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Practical work" });
  title(s, "How I tested it: fixed answers, three runs each");
  const tiles = [
    ["15", "tests", "12 with a problem, 3 safe; answers fixed first", "FaFileCode", C.accent2],
    ["46", "runs", "three per test, plus one extra for TC08", "FaRepeat", C.accent2],
    ["6", "scores", "quality points for each AI review", "FaClipboardCheck", C.accent2],
    ["12", "fixes", "every AI fix applied, then checked", "FaWrench", C.accent1],
  ];
  const tw5 = (CW - 3 * 0.25) / 4;
  tiles.forEach(([num, unit, sub, ic, fill], i) => {
    const x = L + i * (tw5 + 0.25), y = 1.45, h = 1.7;
    box(s, x, y, tw5, h, { fill: C.background2, name: "Tile " + unit });
    circleIcon(s, ic, W, x + 0.22, y + 0.24, 0.5, fill, { name: "Tile icon " + unit });
    txt(s, [run(num, { bold: true, fontSize: 40, color: fill }), run("  " + unit, { bold: true, fontSize: 18, color: C.text2 })],
      { x: x + 0.85, y: y + 0.12, w: tw5 - 0.95, h: 0.75, valign: "middle", objectName: "Tile number " + unit });
    txt(s, sub, { x: x + 0.22, y: y + 0.95, w: tw5 - 0.4, h: 0.65, fontSize: 13, objectName: "Tile text " + unit });
  });
  label(s, "What the 15 tests cover", L, 3.42, 6);
  const cats = [["Network", "5 tests", "FaNetworkWired", C.accent2], ["Encryption", "1 test", "FaLock", C.accent2], ["Logging", "1 test", "FaFileLines", C.accent2],
    ["Secrets", "2 tests", "FaKey", C.accent2], ["Identity", "3 tests", "FaIdBadge", C.accent2], ["Safe code", "3 tests", "FaShieldHalved", C.accent4]];
  const cw5 = (CW - 5 * 0.2) / 6;
  cats.forEach(([nm, n, ic, fill], i) => {
    const x = L + i * (cw5 + 0.2), y = 3.75, h = 0.78;
    box(s, x, y, cw5, h, { fill: C.background1, line: LINE, lineW: 1, name: nm + " chip" });
    circleIcon(s, ic, W, x + 0.15, y + 0.17, 0.44, fill, { name: nm });
    txt(s, [run(nm, { bold: true, color: C.text2, breakLine: true }), run(n, { fontSize: 12, color: C.accent6 })],
      { x: x + 0.68, y: y + 0.08, w: cw5 - 0.75, h: h - 0.16, fontSize: 13, valign: "middle", objectName: nm + " chip text" });
  });
  const by5 = 4.85, bh5 = 1.75;
  box(s, L, by5, 7.4, bh5, { fill: C.text2, name: "Fairness card" });
  circleIcon(s, "FaFingerprint", W, L + 0.25, by5 + 0.18, 0.46, C.accent1, { name: "Fairness" });
  txt(s, "Fairness check: the AI had to work alone", { x: L + 0.85, y: by5 + 0.18, w: 6.3, h: 0.46, fontSize: 17, bold: true, color: C.background1, valign: "middle", objectName: "Fairness heading" });
  const fsteps = [["Found", "Early AI runs could see the scanners’ results"], ["Fixed", "PR #69 made the AI work alone"], ["Checked", "All 46 runs confirmed it"]];
  const fsw = 2.0, fsg = 0.45, fsy = by5 + 0.8, fsh = 0.78;
  fsteps.forEach(([h5, t5], i) => {
    const x = L + 0.25 + i * (fsw + fsg);
    box(s, x, fsy, fsw, fsh, { fill: C.background1, transparency: 88, radius: 0.1, name: "Fairness step " + (i + 1) });
    txt(s, [run((i + 1) + "  " + h5, { bold: true, fontSize: 13, color: C.accent3, breakLine: true }), run(t5, { fontSize: 12, color: C.background1 })],
      { x: x + 0.14, y: fsy, w: fsw - 0.24, h: fsh, valign: "middle", paraSpaceAfter: 1, objectName: "Fairness step text " + (i + 1) });
    if (i < 2) glyph(s, "FaArrowRight", "6C93B8", x + fsw + 0.1, fsy + (fsh - 0.25) / 2, 0.25, "Fairness arrow " + (i + 1));
  });
  const sx5 = L + 7.4 + 0.3, sw5 = R - sx5;
  box(s, sx5, by5, sw5, bh5, { fill: C.background2, name: "Safety card" });
  txt(s, "Safe and ethical", { x: sx5 + 0.25, y: by5 + 0.18, w: sw5 - 0.5, h: 0.35, fontSize: 17, bold: true, color: C.text2, objectName: "Safety heading" });
  ["Fake secrets only", "Nothing deployed to the cloud", "No personal data"].forEach((t, i) => {
    const y = by5 + 0.65 + i * 0.34;
    glyph(s, "FaCheck", "2E7D4F", sx5 + 0.27, y + 0.05, 0.2, "Safety tick " + (i + 1));
    txt(s, t, { x: sx5 + 0.6, y, w: sw5 - 0.8, h: 0.32, fontSize: 14, objectName: "Safety point " + (i + 1) });
  });
  s.addNotes(NOTES[4]);

  // ===== 6 RQ1: detection map =====
  pres.addSection({ title: "Results" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ1: the AI found more than the scanners combined");
  const cases = ["TC02", "TC03", "TC04", "TC05", "TC06", "TC07", "TC08", "TC09", "TC10", "TC11", "TC13", "TC15"];
  const det = {
    "Checkov": ["TC05", "TC06", "TC07", "TC10", "TC11"],
    "tfsec": ["TC02", "TC03", "TC04", "TC07"],
    "Checkov + tfsec": ["TC02", "TC03", "TC04", "TC05", "TC06", "TC07", "TC10", "TC11"],
    "AI reviewer": ["TC02", "TC03", "TC04", "TC05", "TC06", "TC07", "TC09", "TC10", "TC11", "TC13", "TC15"],
  };
  const rowsG = [["Checkov", C.accent2, "5"], ["tfsec", C.accent2, "4"], ["Checkov + tfsec", C.text2, "8"], ["AI reviewer", C.accent1, "11"]];
  const gx = 2.75, cwid = 0.6, cgap = 0.1, ry0 = 1.95, rh = 0.5, rgap = 0.13;
  const colX = (k) => gx + k * (cwid + cgap);
  // bands behind the cases only the AI found
  [[7, 7], [10, 11]].forEach(([a, b], i) => {
    box(s, colX(a) - 0.05, 1.5, colX(b) + cwid - colX(a) + 0.1, ry0 + 4 * rh + 3 * rgap + 0.08 - 1.5, { fill: C.accent1, transparency: 88, line: C.accent1, lineW: 1.25, radius: 0.06, name: "AI-only band " + (i + 1) });
  });
  cases.forEach((c, k) => txt(s, c, { x: colX(k) - 0.1, y: 1.6, w: cwid + 0.2, h: 0.3, fontSize: 11, color: C.accent6, align: "center", objectName: "Case " + c }));
  rowsG.forEach(([nm, fill, total], r) => {
    const y = ry0 + r * (rh + rgap);
    txt(s, nm, { x: L, y, w: 2.05, h: rh, fontSize: 15, bold: true, color: r === 3 ? C.accent1 : C.text2, valign: "middle", objectName: "Row " + nm });
    cases.forEach((c, k) => {
      const hit = det[nm].includes(c), partial = nm === "AI reviewer" && c === "TC08";
      box(s, colX(k), y, cwid, rh, { fill: hit ? fill : C.background2, line: hit ? undefined : LINE, lineW: 0.75, radius: 0.08, name: nm + " " + c });
      if (partial) box(s, colX(k), y, cwid / 2, rh, { fill, radius: 0.08, name: "AI TC08 partial" });
    });
    txt(s, r === 3 ? [run("11 ", { bold: true, fontSize: 24, color: C.accent1 }), run("+1 partly", { fontSize: 12, color: C.accent6 })] : [run(total, { bold: true, fontSize: 24, color: fill })],
      { x: colX(11) + cwid + 0.25, y, w: R - (colX(11) + cwid + 0.25), h: rh, valign: "middle", objectName: "Total " + nm });
  });
  const gEnd = ry0 + 4 * rh + 3 * rgap;
  txt(s, "Each square is one test with a problem.   Filled = found   ·   Half-filled = partly found   ·   Red band = found only by the AI",
    { x: L, y: gEnd + 0.12, w: CW, h: 0.3, fontSize: 12, color: C.accent6, objectName: "Grid key" });
  const tk = [
    ["FaMagnifyingGlass", C.accent1, "3 found only by the AI", "Secrets left in code (TC09, TC15) and a role with too much power (TC13)"],
    ["FaCodeCompare", C.accent2, "Scanners barely overlap", "Only TC07 found by both. Checkov missed “0.0.0.0/0” but caught the same rule written as “*”"],
    ["FaTriangleExclamation", C.accent5, "But some wrong warnings", "Wrong warnings in 3 of 9 safe runs; one said “do not merge”. 82% of its 45 findings were right"],
  ];
  const kw = (CW - 2 * 0.25) / 3, ky = gEnd + 0.55;
  tk.forEach(([ic, fill, head, body], i) => {
    const x = L + i * (kw + 0.25);
    box(s, x, ky, kw, 1.45, { fill: C.background2, name: head + " card" });
    circleIcon(s, ic, W, x + 0.2, ky + 0.2, 0.5, fill, { name: head });
    txt(s, [run(head, { bold: true, fontSize: 15, color: C.text2, breakLine: true }), run(body, { fontSize: 13 })],
      { x: x + 0.85, y: ky + 0.15, w: kw - 1.0, h: 1.2, paraSpaceAfter: 3, objectName: head + " text" });
  });
  txt(s, "Results for these 15 constructed tests only. “Found” = found in every run of that test. 82% becomes 89% if three findings about weak test files count as right.",
    { x: L, y: ky + 1.55, w: CW, h: 0.3, fontSize: 11, italic: true, color: C.accent6, objectName: "Caveat" });
  s.addNotes(NOTES[5]);

  // ===== 7 RQ2 + RQ3 =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ2 and RQ3: useful advice, but some false claims");
  const lw7 = 5.65;
  label(s, "RQ2 · Do the AI’s fixes work?", L, 1.45, lw7);
  [["12/12", "FaCircleCheck", C.accent4, "fixes solved the problem", "8 also confirmed by a scanner"],
   ["9/12", "FaRotate", C.accent2, "AI no longer saw the problem", "an old comment caused 2 HIGH flags\n1 fix not reviewed (delete-only)"],
   ["1", "FaTriangleExclamation", C.accent1, "tip broke the code", "TC10: it said a role needs tags"]].forEach(([big, ic, col, lab, sub], i) => {
    const y = 1.85 + i * 1.08;
    circleIcon(s, ic, W, L, y + 0.12, 0.62, col, { name: "RQ2 " + lab });
    txt(s, big, { x: L + 0.8, y, w: 1.5, h: 0.86, fontSize: 36, bold: true, color: col, valign: "middle", objectName: "RQ2 number " + (i + 1) });
    const subLines = sub.split("\n");
    txt(s, [run(lab, { bold: true, fontSize: 15, color: C.text2, breakLine: true }),
      ...subLines.map((t, k) => run(t, Object.assign({ fontSize: 12, color: C.accent6 }, k < subLines.length - 1 ? { breakLine: true } : {})))],
      { x: L + 2.35, y, w: lw7 - 2.35, h: 0.86, valign: "middle", paraSpaceAfter: 2, objectName: "RQ2 label " + (i + 1) });
  });
  box(s, L, 5.2, lw7, 0.95, { fill: C.background2, name: "Validate error card" });
  txt(s, [run("Terraform’s check, after following that tip", { fontSize: 11, color: C.accent6, breakLine: true }),
    run("An argument named \"tags\" is not expected here.", { fontSize: 13, color: C.accent1, bold: true, fontFace: MONO })],
    { x: L + 0.2, y: 5.2, w: lw7 - 0.4, h: 0.95, valign: "middle", paraSpaceAfter: 3, objectName: "Validate error" });
  const rx7 = 6.75, rw7 = R - rx7;
  label(s, "RQ3 · Do its comments help understanding?", rx7, 1.45, rw7);
  const cwc = (rw7 - 0.2) / 2, cy7 = 1.8, ch7 = 1.55;
  box(s, rx7, cy7, cwc, ch7, { fill: C.background2, name: "Scanner comment card" });
  txt(s, "Scanner says", { x: rx7 + 0.18, y: cy7 + 0.12, w: cwc - 0.3, h: 0.3, fontSize: 13, bold: true, color: C.accent6, objectName: "Scanner says" });
  txt(s, "CRITICAL · AVD-AZU-0047 — Security group rule allows ingress from public internet.",
    { x: rx7 + 0.18, y: cy7 + 0.45, w: cwc - 0.3, h: ch7 - 0.5, fontSize: 11, fontFace: MONO, objectName: "Scanner example" });
  const ax7 = rx7 + cwc + 0.2;
  box(s, ax7, cy7, cwc, ch7, { fill: C.background1, line: H.accent1, lineW: 1.5, name: "AI comment card" });
  txt(s, "AI explains", { x: ax7 + 0.18, y: cy7 + 0.12, w: cwc - 0.3, h: 0.3, fontSize: 13, bold: true, color: C.accent1, objectName: "AI explains" });
  ["What is wrong", "Why it matters", "How to fix it"].forEach((t, i) => {
    const y = cy7 + 0.5 + i * 0.33;
    glyph(s, "FaCheck", "2E7D4F", ax7 + 0.2, y + 0.05, 0.2, "AI tick " + (i + 1));
    txt(s, t, { x: ax7 + 0.5, y, w: cwc - 0.6, h: 0.3, fontSize: 14, bold: true, color: C.text2, objectName: "AI point " + (i + 1) });
  });
  s.addChart(pres.charts.BAR, [{ name: "Score out of 2", labels: ["Explanation accuracy", "Developer usefulness", "Impact explanation"], values: [1.65, 1.76, 1.89] }], {
    x: rx7, y: 3.45, w: rw7, h: 1.85, barDir: "bar", barGapWidthPct: 40,
    chartColors: [H.accent1, H.accent2, H.accent2],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: H.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 13, catAxisLabelColor: H.dk1,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 2, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false,
    showLegend: false, showTitle: true, title: "Average score out of 2 (37 runs)", titleFontFace: "+mn-lt", titleFontSize: 13, titleColor: H.dk2,
    lang: LANG, objectName: "Score chart",
  });
  txt(s, [run("Risk: ", { bold: true, color: C.accent1 }), run("sometimes wrong, but sounds sure of itself (Ji et al., 2023)")],
    { x: rx7, y: 5.4, w: rw7, h: 0.45, fontSize: 15, objectName: "RQ3 risk" });
  txt(s, "Scored once, with AI help; the reason for each score is recorded.",
    { x: rx7, y: 5.9, w: rw7, h: 0.3, fontSize: 11, italic: true, color: C.accent6, objectName: "Scoring caveat" });
  s.addNotes(NOTES[6]);

  // ===== 8 RQ4 =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ4: code comments changed the AI’s verdict");
  const lw8 = 7.05;
  const variant = (y, h, tag, head, code, codeH, pill, pillFill, pillIcon, says) => {
    box(s, L, y, lw8, h, { fill: C.background1, line: LINE, lineW: 1, shadow: true, name: tag + " card" });
    txt(s, [run(tag + "  ", { bold: true, color: C.accent1 }), run(head, { bold: true, color: C.text2 })],
      { x: L + 0.25, y: y + 0.14, w: lw8 - 0.5, h: 0.34, fontSize: 16, objectName: tag + " heading" });
    box(s, L + 0.25, y + 0.55, lw8 - 0.5, codeH, { fill: C.background2, radius: 0.04, name: tag + " code box" });
    txt(s, [run(code, { color: C.accent4, breakLine: true }), run("source_address_prefix = \"203.0.113.10/32\"")],
      { x: L + 0.35, y: y + 0.55, w: lw8 - 0.6, h: codeH, fontSize: 10, fontFace: MONO, valign: "middle", objectName: tag + " code" });
    const py = y + 0.55 + codeH + 0.18;
    box(s, L + 0.25, py, 2.35, 0.48, { fill: pillFill, radius: 0.24, name: tag + " verdict pill" });
    glyph(s, pillIcon, W, L + 0.42, py + 0.12, 0.24, tag + " verdict icon");
    txt(s, pill, { x: L + 0.75, y: py, w: 1.8, h: 0.48, fontSize: 15, bold: true, color: C.background1, valign: "middle", objectName: tag + " verdict" });
    txt(s, says, { x: L + 2.8, y: py, w: lw8 - 3.0, h: 0.48, fontSize: 13, valign: "middle", objectName: tag + " says" });
  };
  variant(1.45, 2.0, "(a)", "Old comment left in · PR #85", "# TC02: Deliberately unrestricted SSH access", 0.55,
    "HIGH · 70/100", C.accent1, "FaTriangleExclamation", "AI flagged its own fix, quoting the comment");
  variant(3.6, 2.0, "(b)", "Only the comment changed · PR #98", "# TC02 remediated: SSH restricted to the approved administration address.", 0.55,
    "LOW · 95/100", C.accent4, "FaCheck", "AI approved the same fix, with a low note");
  txt(s, "Same code, different comment, different answer (TC03 did the same). Text the AI reads can steer it (Greshake et al., 2023).",
    { x: L, y: 5.78, w: lw8, h: 0.5, fontSize: 12, italic: true, color: C.accent6, objectName: "Comment caption" });
  const rx8 = 7.95, rw8 = R - rx8, ch8 = 1.45, tx8 = rx8 + 0.9, tw8 = rw8 - 1.05;
  const card8 = (y, ic, fill, head) => {
    box(s, rx8, y, rw8, ch8, { fill: C.background2, name: head + " card" });
    circleIcon(s, ic, W, rx8 + 0.2, y + 0.2, 0.55, fill, { name: head });
    txt(s, head, { x: tx8, y: y + 0.17, w: tw8, h: 0.34, fontSize: 15, bold: true, color: C.text2, objectName: head + " heading" });
  };
  // card 1: the same test gave different severities
  card8(1.45, "FaShuffle", C.accent5, "Same test, different answers");
  [["HIGH", C.accent1, 0.88], ["HIGH", C.accent1, 0.88], ["MEDIUM", C.accent5, 1.15]].reduce((x, [sev, col, w], k) => {
    box(s, x, 1.45 + 0.6, w, 0.36, { fill: col, radius: 0.18, name: "TC05 run " + (k + 1) });
    txt(s, sev, { x, y: 1.45 + 0.6, w, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "TC05 run " + (k + 1) + " severity" });
    return x + w + 0.12;
  }, tx8);
  txt(s, "TC05, three runs (Ouyang et al., 2025)", { x: tx8, y: 1.45 + 1.03, w: tw8, h: 0.28, fontSize: 12, color: C.accent6, objectName: "TC05 caption" });
  // card 2: findings that never reach the developer
  card8(3.05, "FaEyeSlash", C.accent1, "Some problems stay hidden");
  txt(s, [{ text: "“Needs context” findings are not shown", options: { bullet: { indent: 12 }, lang: LANG, breakLine: true } },
    { text: "Delete-only changes skip the AI", options: { bullet: { indent: 12 }, lang: LANG } }],
    { x: tx8, y: 3.05 + 0.58, w: tw8, h: 0.7, fontSize: 13, paraSpaceAfter: 4, objectName: "Hidden points" });
  // card 3: speed
  card8(4.65, "FaStopwatch", C.accent2, "Fast enough");
  txt(s, [run("under 2 minutes", { bold: true, fontSize: 24, color: C.accent2, breakLine: true }), run("for feedback; the AI took about 30 seconds", { fontSize: 12, color: C.accent6 })],
    { x: tx8, y: 4.65 + 0.48, w: tw8, h: 0.85, paraSpaceAfter: 1, objectName: "Speed" });
  s.addNotes(NOTES[7]);

  // ===== 9 Evaluation =====
  pres.addSection({ title: "Evaluation and conclusion" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evaluation and conclusion" });
  title(s, "Evaluation: what holds up, and its limits");
  const colw9 = (CW - 2 * 0.3) / 3, ch9 = 3.95;
  [["FaCircleCheck", C.accent4, "What holds up", ["Scanners only see their own rules", "Scanners complement each other", "The AI caught context problems the scanners missed", "The AI’s answers changed between identical runs"]],
   ["FaTriangleExclamation", C.accent5, "Limits", ["Only 15 tests, written by me", "One cloud and one AI model", "Some tests chosen where scanners are weak (Ding et al., 2025)", "Comments and a policy file may have helped the AI", "Scored once, with AI help"]]].forEach(([ic, fill, head, items], i) => {
    const x = L + i * (colw9 + 0.3);
    box(s, x, 1.45, colw9, ch9, { fill: C.background2, name: head + " column" });
    circleIcon(s, ic, W, x + 0.25, 1.62, 0.58, fill, { name: head });
    txt(s, head, { x: x + 0.98, y: 1.62, w: colw9 - 1.2, h: 0.58, fontSize: 19, bold: true, color: C.text2, valign: "middle", objectName: head + " heading" });
    txt(s, items.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, lang: LANG, breakLine: j < items.length - 1 } })),
      { x: x + 0.25, y: 2.38, w: colw9 - 0.45, h: ch9 - 1.05, fontSize: 14, paraSpaceAfter: 8, objectName: head + " points" });
  });
  const x9 = L + 2 * (colw9 + 0.3);
  box(s, x9, 1.45, colw9, ch9, { fill: C.text2, name: "Lesson column" });
  circleIcon(s, "FaLightbulb", W, x9 + 0.25, 1.62, 0.58, C.accent1, { name: "Lesson" });
  txt(s, "What I learned", { x: x9 + 0.98, y: 1.62, w: colw9 - 1.2, h: 0.58, fontSize: 19, bold: true, color: C.background1, valign: "middle", objectName: "Lesson heading" });
  txt(s, "“I trust a result only when I can link it to its run, commit and raw output.”", { x: x9 + 0.3, y: 2.32, w: colw9 - 0.6, h: 1.05, fontSize: 17, italic: true, fontFace: "Cambria", color: C.background1, objectName: "Lesson quote" });
  // evidence chain: run -> commit -> raw output
  const chain = [["FaGears", "Run"], ["FaCodeCommit", "Commit"], ["FaFileCode", "Raw output"]];
  const cstep = (colw9 - 0.6) / 3;
  chain.forEach(([ic, lab], i) => {
    const cx = x9 + 0.3 + i * cstep + cstep / 2;
    circleIcon(s, ic, W, cx - 0.25, 3.5, 0.5, C.accent2, { name: "Chain " + lab });
    txt(s, lab, { x: cx - 0.6, y: 4.06, w: 1.2, h: 0.26, fontSize: 12, color: C.background1, align: "center", objectName: "Chain label " + lab });
    if (i < 2) glyph(s, "FaArrowRight", "6C93B8", cx + cstep / 2 - 0.11, 3.64, 0.22, "Chain arrow " + (i + 1));
  });
  txt(s, "Tracing results this way is how I found my own fairness flaw. I fixed it before reporting any results.",
    { x: x9 + 0.3, y: 4.5, w: colw9 - 0.6, h: 0.7, fontSize: 12, color: C.background1, objectName: "Lesson note" });
  label(s, "Objectives: all met, within the limits of 15 tests", L, 5.6, CW, C.accent4);
  const objs = [["O1", "Literature review"], ["O2", "Working pipeline"], ["O3", "Scanner comparison"], ["O4", "Benefits and limits"]];
  const ow = (CW - 3 * 0.2) / 4;
  objs.forEach(([k, v], i) => {
    const x = L + i * (ow + 0.2);
    box(s, x, 5.93, ow, 0.55, { fill: C.background1, line: H.accent4, lineW: 1.25, radius: 0.27, name: k + " objective" });
    circleIcon(s, "FaCheck", W, x + 0.1, 6.015, 0.38, C.accent4, { name: k + " check", pad: 0.24 });
    txt(s, [run(k + "  ", { bold: true, color: C.accent4 }), run(v)], { x: x + 0.58, y: 5.93, w: ow - 0.65, h: 0.55, fontSize: 13, valign: "middle", objectName: k + " text" });
  });
  s.addNotes(NOTES[8]);

  // ===== 10 Conclusion + references =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evaluation and conclusion" });
  title(s, "Conclusion: an advisor beside scanners, not a gate");
  const lw10 = 7.05;
  box(s, L, 1.45, lw10, 1.4, { fill: C.text2, name: "Answer card" });
  txt(s, [run("A qualified yes", { bold: true, fontSize: 26, color: C.background1, breakLine: true }),
    run("The AI found 11 of the 12 problems, and part of the last one; the two scanners together found 8. But its mistakes are harder to predict.", { fontSize: 14, color: C.background1 })],
    { x: L + 0.3, y: 1.45, w: lw10 - 0.6, h: 1.4, valign: "middle", paraSpaceAfter: 2, objectName: "Answer" });
  const roles = [["FaListCheck", C.accent2, "Scanners", "enforce the rules"], ["FaRobot", C.accent1, "AI", "gives advice"], ["FaUserCheck", C.text2, "People", "decide"]];
  const rwid = lw10 / 3;
  roles.forEach(([ic, fill, who, what], i) => {
    const cx = L + i * rwid + rwid / 2;
    circleIcon(s, ic, W, cx - 0.31, 3.0, 0.62, fill, { name: who });
    txt(s, [run(who, { bold: true, color: C.text2, breakLine: true }), run(what)], { x: cx - 1.1, y: 3.68, w: 2.2, h: 0.5, fontSize: 14, align: "center", objectName: who + " role" });
    if (i < 2) glyph(s, i === 0 ? "FaPlus" : "FaArrowRight", "7A8794", L + (i + 1) * rwid - 0.15, 3.16, 0.3, "Role link " + (i + 1));
  });
  label(s, "My advice", L, 4.32, 4);
  const recs = [["FaLayerGroup", "Use more than one scanner"], ["FaCommentSlash", "Treat comments as untrusted"], ["FaEye", "Show unsure findings"],
    ["FaVial", "Auto-test every AI fix"], ["FaTrashCan", "Check delete-only changes"], ["FaTags", "Log the AI model used"]];
  const rcw = (lw10 - 2 * 0.15) / 3;
  recs.forEach(([ic, t], i) => {
    const x = L + (i % 3) * (rcw + 0.15), y = 4.62 + Math.floor(i / 3) * 0.62;
    box(s, x, y, rcw, 0.52, { fill: C.background2, radius: 0.26, name: "Advice " + (i + 1) });
    circleIcon(s, ic, W, x + 0.08, y + 0.07, 0.38, C.accent2, { name: "Advice icon " + (i + 1), pad: 0.25 });
    txt(s, t, { x: x + 0.53, y, w: rcw - 0.6, h: 0.52, fontSize: 12, valign: "middle", objectName: "Advice text " + (i + 1) });
  });
  circleIcon(s, "FaFlaskVial", W, L, 6.03, 0.42, C.accent1, { name: "Next steps" });
  txt(s, [run("Next: ", { bold: true, color: C.text2 }), run("real-world code · more AI models · comment-trick tests · real developers")],
    { x: L + 0.55, y: 5.99, w: lw10 - 0.6, h: 0.5, fontSize: 13, valign: "middle", objectName: "Next steps text" });
  const rfx = L + lw10 + 0.35, rfw = R - rfx;
  label(s, "References", rfx, 1.45, rfw);
  const refs = [
    ["Ding, Y. et al. (2025) ‘Vulnerability detection with code language models: How far are we?’, ", "Proceedings of the 47th IEEE/ACM ICSE", "."],
    ["Greshake, K. et al. (2023) ‘Not what you’ve signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection’, ", "Proceedings of AISec ’23", ", pp. 79–90."],
    ["Ji, Z. et al. (2023) ‘Survey of hallucination in natural language generation’, ", "ACM Computing Surveys", ", 55(12), pp. 1–38."],
    ["Johnson, B. et al. (2013) ‘Why don’t software developers use static analysis tools to find bugs?’, ", "Proceedings of the 35th ICSE", ", pp. 672–681."],
    ["Li, H. et al. (2024) ‘Enhancing static analysis for practical bug detection: An LLM-integrated approach’, ", "Proceedings of the ACM on Programming Languages", ", 8(OOPSLA1), Article 111."],
    ["Microsoft (2024) ", "Shared responsibility in the cloud", ". Available at: https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility (Accessed: 23 July 2026)."],
    ["Morris, K. (2020) ", "Infrastructure as Code: Dynamic Systems for the Cloud Age", ". 2nd edn. Sebastopol, CA: O’Reilly Media."],
    ["Ouyang, S. et al. (2025) ‘An empirical study of the non-determinism of ChatGPT in code generation’, ", "ACM Transactions on Software Engineering and Methodology", ", 34(2), pp. 1–28."],
    ["Pearce, H. et al. (2023) ‘Examining zero-shot vulnerability repair with large language models’, ", "2023 IEEE Symposium on Security and Privacy", ", pp. 2339–2356."],
    ["Rahman, A., Parnin, C. and Williams, L. (2019) ‘The seven sins: Security smells in infrastructure as code scripts’, ", "Proceedings of the 41st ICSE", ", pp. 164–175."],
  ];
  const refRuns = [];
  refs.forEach(([a, b, c], i) => { refRuns.push(run(a)); refRuns.push(run(b, { italic: true })); refRuns.push(run(c, i < refs.length - 1 ? { breakLine: true } : {})); });
  txt(s, refRuns, { x: rfx, y: 1.76, w: rfw, h: 4.85, fontSize: 10, paraSpaceAfter: 3, objectName: "Reference list" });
  s.addNotes(NOTES[9]);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  await setLanguage(OUT);
  console.log("Wrote", OUT);
}
async function setLanguage(file) {
  const fs = require("fs");
  const JSZip = require("/opt/npm-tools/node_modules/jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const names = Object.keys(zip.files).filter((n) => /^ppt\/(slides|notesSlides|slideLayouts|slideMasters|notesMasters)\/[^/]+\.xml$/.test(n) || n === "ppt/presentation.xml");
  for (const n of names) {
    const x = await zip.file(n).async("string");
    const y = x.replace(/lang="en-US"/g, 'lang="en-GB"').replace(/<p:ph\b[^>]*\btype="title"[^>]*>/g, (m) => m.replace(/\s+idx="\d+"/, ""));
    if (y !== x) zip.file(n, y);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
build().catch((e) => { console.error(e); process.exit(1); });
