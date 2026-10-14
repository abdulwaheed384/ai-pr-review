// PROM06 recorded presentation — Abdul Waheed (209333039)
// Structured deck: theme, two layouts, sections, native charts/tables, speaker notes.
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
const H = THEME.colors; // hex values for hex-only options (charts, shadows, icon pixels)

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
const L = 0.6, R = 12.733, CW = R - L; // margins and content width
const LINE = "D3DAE2"; // hairline borders

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
const NEEDED = [
  ["FaCode", "FFFFFF"], ["FaCloud", "FFFFFF"], ["FaBellSlash", "FFFFFF"], ["FaBrain", "FFFFFF"],
  ["FaCodePullRequest", "08233E"], ["FaListCheck", "FFFFFF"], ["FaShieldHalved", "FFFFFF"], ["FaRobot", "FFFFFF"],
  ["FaCodePullRequest", "FFFFFF"], ["FaFileCode", "FFFFFF"], ["FaRepeat", "FFFFFF"], ["FaScaleBalanced", "FFFFFF"],
  ["FaClipboardCheck", "FFFFFF"], ["FaWrench", "FFFFFF"], ["FaFingerprint", "FFFFFF"], ["FaBookOpen", "FFFFFF"],
  ["FaBullseye", "FFFFFF"], ["FaMagnifyingGlass", "FFFFFF"], ["FaCodeCompare", "FFFFFF"], ["FaTriangleExclamation", "FFFFFF"],
  ["FaShuffle", "FFFFFF"], ["FaEyeSlash", "FFFFFF"], ["FaStopwatch", "FFFFFF"], ["FaCircleCheck", "FFFFFF"],
  ["FaLightbulb", "FFFFFF"], ["FaCheck", "FFFFFF"], ["FaCommentDots", "FFFFFF"], ["FaFlaskVial", "FFFFFF"], ["FaUserShield", "FFFFFF"],
];

// ---------- helpers ----------
// keep citations together: "Johnson et al., 2013" and "Morris, 2020" never break across lines
function nb(t) {
  if (typeof t !== "string") return t;
  return t.replace(/ et al\.,? /g, (m) => m.replace(/ /g, " ")).replace(/\(([A-Z][A-Za-z’']+), (\d{4})/g, "($1, $2")
    .replace(/PR #/g, "PR #").replace(/pp\. /g, "pp. ").replace(/RFC 5737/g, "RFC 5737");
}
function txt(slide, text, o) {
  const body = Array.isArray(text) ? text.map((r) => ({ text: nb(r.text), options: r.options })) : nb(text);
  slide.addText(body, Object.assign({ isTextBox: true, lang: LANG, margin: 0, fontSize: 14, color: C.text1, valign: "top", fit: "none" }, o));
}
function run(text, o) { return { text, options: Object.assign({ lang: LANG }, o || {}) }; }
function lines(arr, o) { return arr.map((t, i) => run(t, Object.assign({}, o || {}, i < arr.length - 1 ? { breakLine: true } : {}))); }
function box(slide, x, y, w, h, o) {
  o = o || {};
  const opts = {
    x, y, w, h, rectRadius: o.radius === undefined ? 0.08 : o.radius,
    fill: { color: o.fill || C.background2 },
    line: o.line ? { color: o.line, width: o.lineW || 1 } : { color: o.fill || C.background2, width: 0 },
    objectName: o.name || "Card",
  };
  if (o.shadow) opts.shadow = { type: "outer", color: "000000", blur: 7, offset: 2, angle: 90, opacity: 0.13 };
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, opts);
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
function vline(slide, x, y1, y2, arrow, name) {
  slide.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2 - y1, line: Object.assign({ color: H.accent6, width: 1.5 }, arrow ? { endArrowType: "triangle" } : {}), objectName: name || "Connector" });
}
function hline(slide, x1, x2, y, name) {
  slide.addShape(pres.shapes.LINE, { x: x1, y, w: x2 - x1, h: 0, line: { color: H.accent6, width: 1.5 }, objectName: name || "Connector" });
}
function label(slide, text, x, y, w) { // small spaced capitals section label
  txt(slide, text.toUpperCase(), { x, y, w, h: 0.28, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5, objectName: "Label " + text });
}
function title(slide, t) { slide.addText(t, { placeholder: "title", lang: LANG }); }
function iconCard(slide, x, y, w, h, ic, fill, head, body, o) {
  o = o || {};
  box(slide, x, y, w, h, { fill: o.cardFill || C.background2, name: head + " card" });
  const d = o.d || 0.55;
  circleIcon(slide, ic, "FFFFFF", x + 0.22, y + 0.22, d, fill, { name: head });
  txt(slide, [run(head, { bold: true, fontSize: o.headSize || 16, color: o.headColor || C.text2, breakLine: true }), run(body, { fontSize: o.bodySize || 14, color: o.bodyColor || C.text1 })],
    { x: x + d + 0.42, y: y + 0.18, w: w - d - 0.6, h: h - 0.3, paraSpaceAfter: 3, objectName: head + " text" });
}

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

// ---------- slides ----------
async function build() {
  for (const [n, h] of NEEDED) await icon(n, h);

  // ===== 1 Title =====
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
  // motif: one pull request, three independent reviewers
  const cxs = [9.75, 11.0, 12.25], d = 0.8, prY = 4.45, revY = 5.6;
  circleIcon(s, "FaCodePullRequest", "08233E", 11.0 - d / 2, prY, d, C.background1, { name: "Pull request", pad: 0.24 });
  s.addShape(pres.shapes.LINE, { x: cxs[0], y: prY + d, w: 11.0 - cxs[0], h: revY - prY - d, flipH: true, line: { color: C.accent3, width: 1.25 }, objectName: "Connector left" });
  s.addShape(pres.shapes.LINE, { x: 11.0, y: prY + d, w: 0, h: revY - prY - d, line: { color: C.accent3, width: 1.25 }, objectName: "Connector middle" });
  s.addShape(pres.shapes.LINE, { x: 11.0, y: prY + d, w: cxs[2] - 11.0, h: revY - prY - d, line: { color: C.accent3, width: 1.25 }, objectName: "Connector right" });
  [["Checkov", "FaListCheck", C.accent3], ["tfsec", "FaShieldHalved", C.accent3], ["AI reviewer", "FaRobot", C.accent1]].forEach(([nm, ic, fill], i) => {
    circleIcon(s, ic, "FFFFFF", cxs[i] - d / 2, revY, d, fill, { name: nm, ring: C.background1, ringW: 1.5 });
    txt(s, nm, { x: cxs[i] - 0.62, y: revY + d + 0.08, w: 1.24, h: 0.3, fontSize: 13, color: C.background1, align: "center", objectName: nm + " label" });
  });
  s.addNotes(NOTES[0]);

  // ===== 2 Problem, aim, RQs, objectives =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  title(s, "Can an AI reviewer catch what scanners miss?");
  const rows2 = [
    ["FaCode", C.accent2, "Infrastructure is now code", "Terraform defines cloud resources as code (Morris, 2020), so one insecure line is copied to every environment."],
    ["FaCloud", C.accent2, "Configuration is the customer’s job", "Under shared responsibility, securing cloud configuration falls to the customer (Microsoft, 2024)."],
    ["FaBellSlash", C.accent2, "Scanners only see their rules", "Checkov and tfsec are fast and consistent, but noisy, terse warnings get ignored (Johnson et al., 2013)."],
    ["FaBrain", C.accent1, "AI reads context, but can be wrong", "LLMs explain in plain language, yet hallucinate and vary between runs (Ji et al., 2023; Ouyang et al., 2025)."],
  ];
  rows2.forEach(([ic, fill, head, body], i) => {
    const y = 1.5 + i * 1.3;
    circleIcon(s, ic, "FFFFFF", L, y + 0.02, 0.62, fill, { name: head });
    txt(s, [run(head, { bold: true, fontSize: 17, color: C.text2, breakLine: true }), run(body, { fontSize: 14 })],
      { x: L + 0.85, y, w: 5.4, h: 1.15, paraSpaceAfter: 3, objectName: "Problem " + (i + 1) });
  });
  const bx = 7.15, bw = R - bx;
  box(s, bx, 1.45, bw, 5.2, { fill: C.background2, name: "Aim and questions card" });
  label(s, "Aim", bx + 0.3, 1.64, 3);
  txt(s, "Evaluate how effective an AI security reviewer is in a DevSecOps pipeline for Terraform, compared with Checkov and tfsec.",
    { x: bx + 0.3, y: 1.93, w: bw - 0.6, h: 0.75, objectName: "Aim" });
  label(s, "Research questions", bx + 0.3, 2.8, 4);
  const rqs = [
    ["RQ1", "How accurately does the AI reviewer detect IaC vulnerabilities compared with Checkov and tfsec?"],
    ["RQ2", "What is the quality of the AI’s remediation guidance?"],
    ["RQ3", "What is the likely impact of AI feedback on developer understanding?"],
    ["RQ4", "What practical challenges arise in integrating AI review into a secure development workflow?"],
  ];
  const rqRuns = [];
  rqs.forEach(([k, v], i) => { rqRuns.push(run(k + "  ", { bold: true, color: C.accent1 })); rqRuns.push(run(v, i < rqs.length - 1 ? { breakLine: true } : {})); });
  txt(s, rqRuns, { x: bx + 0.3, y: 3.09, w: bw - 0.6, h: 2.2, paraSpaceAfter: 5, objectName: "Research questions" });
  label(s, "Objectives", bx + 0.3, 5.3, 4);
  const objs2 = [["O1", "Review the literature"], ["O2", "Design and build an AI review pipeline"], ["O3", "Evaluate it against scanners and fixed ground truth"], ["O4", "Investigate the benefits and limits of AI feedback"]];
  const objRuns = [];
  objs2.forEach(([k, v], i) => { objRuns.push(run(k + "  ", { bold: true, color: C.accent1 })); objRuns.push(run(v, i < objs2.length - 1 ? { breakLine: true } : {})); });
  txt(s, objRuns, { x: bx + 0.3, y: 5.59, w: bw - 0.6, h: 0.98, objectName: "Objectives" });
  s.addNotes(NOTES[1]);

  // ===== 3 Literature =====
  pres.addSection({ title: "Research context" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Research context" });
  title(s, "How the literature shaped the study");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 14, lang: LANG } });
  const cell = (t, o) => ({ text: nb(t), options: Object.assign({ fontSize: 14, color: C.text1, lang: LANG }, o || {}) });
  const litRows = [
    ["Developers ignore noisy, poorly explained warnings (Johnson et al., 2013)", "Measured false alarms and scored the explanations, not only detections"],
    ["IaC “security smells”, such as open addresses and hard-coded secrets, recur in real scripts (Rahman et al., 2019)", "Linked the test cases to documented smells: TC02–TC04 (open addresses), TC09 and TC15 (secrets)"],
    ["Hybrid designs feed static-analysis output to the LLM (Li et al., 2024), so the AI’s own share is hidden", "Kept the AI independent of the scanners and ran every case that way"],
    ["LLMs give different answers to the same request (Ouyang et al., 2025)", "Repeated every AI review three times on identical input"],
    ["LLM claims and fixes can be wrong (Ji et al., 2023; Pearce et al., 2023)", "Applied every AI fix and re-tested it with validate, both scanners and the AI"],
  ];
  const tRows = [[hdr("What the literature shows"), hdr("How I applied it")]];
  litRows.forEach(([a, b], i) => {
    const fill = { color: i % 2 === 0 ? C.background1 : C.background2 };
    tRows.push([cell(a, { fill }), cell(b, { fill })]);
  });
  s.addTable(tRows, { x: L, y: 1.45, w: CW, colW: [6.35, CW - 6.35], fontSize: 14, valign: "middle", margin: [0.07, 0.14, 0.07, 0.14],
    border: { type: "solid", pt: 0.75, color: LINE }, rowH: [0.42, 0.6, 0.6, 0.6, 0.6, 0.6], lang: LANG, objectName: "Literature to design table" });
  const cy3 = 5.15, ch3 = 1.5, cw3 = (CW - 0.3) / 2;
  iconCard(s, L, cy3, cw3, ch3, "FaBookOpen", C.accent2, "Also used to interpret the results",
    "Indirect prompt injection helps explain why code comments changed verdicts (Greshake et al., 2023); constructed test sets can flatter AI, so my results are descriptive (Ding et al., 2025).", { bodySize: 14, headSize: 15 });
  iconCard(s, L + cw3 + 0.3, cy3, cw3, ch3, "FaBullseye", C.accent1, "The gap",
    "Little head-to-head evidence of an AI reviewer against Terraform scanners on the same changes and a fixed ground truth, with independence, repeatability and fixes tested together.",
    { cardFill: C.text2, headColor: C.background1, bodyColor: C.background1, headSize: 15 });
  s.addNotes(NOTES[2]);

  // ===== 4 Artefact =====
  pres.addSection({ title: "Practical work" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Practical work" });
  title(s, "What I built: three independent reviewers");
  const fx = L, fw = 6.3, mid = fx + fw / 2;
  const step = (y, h, text, name, ic) => {
    box(s, fx, y, fw, h, { fill: C.background2, name });
    circleIcon(s, ic, "FFFFFF", fx + 0.14, y + (h - 0.42) / 2, 0.42, C.text2, { name: name + " icon" });
    txt(s, text, { x: fx + 0.7, y, w: fw - 0.85, h, valign: "middle", objectName: name + " text" });
  };
  step(1.45, 0.5, [run("Developer opens a Terraform pull request", { bold: true })], "Step PR", "FaCodePullRequest");
  vline(s, mid, 1.95, 2.15, true, "Arrow to validate");
  step(2.15, 0.5, [run("Validate: ", { bold: true }), run("terraform fmt and validate (never plan or apply)")], "Step validate", "FaCircleCheck");
  const tw = (fw - 0.4) / 3, tY = 2.95, tH = 1.85;
  const tcx = [0, 1, 2].map((i) => fx + i * (tw + 0.2) + tw / 2);
  vline(s, mid, 2.65, 2.8, false, "Fan-out stem");
  hline(s, tcx[0], tcx[2], 2.8, "Fan-out bar");
  tcx.forEach((x, i) => vline(s, x, 2.8, tY, true, "Fan-out arrow " + (i + 1)));
  const tools = [
    ["Checkov 3.3.1", "Rule-based policy checks", C.accent2, "FaListCheck"],
    ["tfsec 1.28.14", "Rule-based checks", C.accent2, "FaShieldHalved"],
    ["AI reviewer", "Claude reads all .tf files, policy and README; JSON, max 3 findings", C.accent1, "FaRobot"],
  ];
  tools.forEach(([nm, desc, fill, ic], i) => {
    const x = fx + i * (tw + 0.2);
    box(s, x, tY, tw, tH, { fill: C.background1, line: fill, lineW: 1.25, name: nm + " box" });
    circleIcon(s, ic, "FFFFFF", x + (tw - 0.5) / 2, tY + 0.12, 0.5, fill, { name: nm });
    txt(s, [run(nm, { bold: true, fontSize: 14, color: C.text2, breakLine: true }), run(desc, { fontSize: 12 })],
      { x: x + 0.1, y: tY + 0.7, w: tw - 0.2, h: tH - 0.75, align: "center", paraSpaceAfter: 2, objectName: nm + " text" });
  });
  const fanInY = tY + tH + 0.15;
  tcx.forEach((x, i) => vline(s, x, tY + tH, fanInY, false, "Fan-in stem " + (i + 1)));
  hline(s, tcx[0], tcx[2], fanInY, "Fan-in bar");
  vline(s, mid, fanInY, fanInY + 0.15, true, "Arrow to comments");
  const cY = fanInY + 0.15;
  step(cY, 0.5, [run("Three separate PR comments; ", { bold: true }), run("all raw outputs saved per run")], "Step comments", "FaCommentDots");
  vline(s, mid, cY + 0.5, cY + 0.7, true, "Arrow to classify");
  step(cY + 0.7, 0.5, [run("I classify every output against the ground truth", { bold: true })], "Step classify", "FaScaleBalanced");
  // evidence panel
  const ex = 7.3, ew = R - ex;
  txt(s, [run("Evidence: pull request #71", { bold: true, color: C.text2, fontSize: 16, breakLine: true }),
    run("TC02 · inbound SSH open to 0.0.0.0/0 · copied verbatim from the PR", { fontSize: 12, color: C.accent6 })],
    { x: ex, y: 1.45, w: ew, h: 0.62, objectName: "Evidence heading" });
  const ev = [
    ["Checkov", "MISSED", C.accent6, "FaListCheck", C.accent6, ["Passed: 7 · Failed: 0 · Skipped: 0", "No failed checks were reported."], 1.16],
    ["tfsec", "DETECTED", C.accent4, "FaShieldHalved", C.accent2, ["CRITICAL · AVD-AZU-0047 — Security group rule allows ingress from public internet."], 1.16],
    ["AI reviewer", "DETECTED", C.accent4, "FaRobot", C.accent1, ["HIGH · SECURITY_VULNERABILITY · Unrestricted inbound SSH access permitted from any source address", "70/100 — MEDIUM — APPROVE_WITH_COMMENTS"], 1.6],
  ];
  let ey = 2.17;
  ev.forEach(([nm, tag, tagFill, ic, icFill, ls, h]) => {
    box(s, ex, ey, ew, h, { fill: C.background1, line: LINE, lineW: 1, shadow: true, name: nm + " evidence card" });
    circleIcon(s, ic, "FFFFFF", ex + 0.18, ey + 0.16, 0.42, icFill, { name: nm + " evidence" });
    txt(s, nm, { x: ex + 0.75, y: ey + 0.16, w: 2.5, h: 0.42, bold: true, color: C.text2, valign: "middle", objectName: nm + " name" });
    box(s, ex + ew - 1.38, ey + 0.2, 1.2, 0.34, { fill: tagFill, radius: 0.17, name: nm + " tag" });
    txt(s, tag, { x: ex + ew - 1.38, y: ey + 0.2, w: 1.2, h: 0.34, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", charSpacing: 1, objectName: nm + " tag text" });
    txt(s, lines(ls), { x: ex + 0.75, y: ey + 0.66, w: ew - 0.95, h: h - 0.74, fontSize: 12, fontFace: MONO, paraSpaceAfter: 2, objectName: nm + " output" });
    ey += h + 0.14;
  });
  txt(s, "Dissertation Figure 4.2 · github.com/abdulwaheed384/ai-pr-review",
    { x: ex, y: ey + 0.02, w: ew, h: 0.3, fontSize: 11, color: C.accent6, objectName: "Evidence source" });
  s.addNotes(NOTES[3]);

  // ===== 5 Method =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Practical work" });
  title(s, "How I tested it: fixed ground truth, repeated runs");
  const steps5 = [
    ["1", "Define", "15 Terraform cases; ground truth fixed before any run", "FaFileCode"],
    ["2", "Run", "Each case as a pull request, then twice more: 46 runs", "FaRepeat"],
    ["3", "Classify", "Every output checked against the ground truth", "FaScaleBalanced"],
    ["4", "Score", "AI output scored 0–2 on six dimensions fixed in advance", "FaClipboardCheck"],
    ["5", "Re-test", "AI’s 12 fixes applied; validate, scanners and AI re-run", "FaWrench"],
  ];
  const sw = (CW - 4 * 0.2) / 5;
  steps5.forEach(([n, head, body, ic], i) => {
    const x = L + i * (sw + 0.2);
    box(s, x, 1.45, sw, 1.95, { fill: C.background2, name: "Step " + n });
    circleIcon(s, ic, "FFFFFF", x + 0.2, 1.62, 0.5, i === 4 ? C.accent1 : C.accent2, { name: head });
    txt(s, n, { x: x + sw - 0.55, y: 1.62, w: 0.35, h: 0.5, fontSize: 26, bold: true, color: C.accent3, align: "right", valign: "middle", objectName: "Step number " + n });
    txt(s, [run(head, { bold: true, fontSize: 16, color: C.text2, breakLine: true }), run(body, { fontSize: 14 })],
      { x: x + 0.2, y: 2.22, w: sw - 0.35, h: 1.12, paraSpaceAfter: 2, objectName: "Step text " + n });
  });
  const tcHdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 13, lang: LANG } });
  const tcCell = (t, o) => ({ text: t, options: Object.assign({ fontSize: 13, color: C.text1, lang: LANG }, o || {}) });
  const tc = [
    ["Network", "TC02–TC04 SSH, RDP, HTTP open to the internet · TC05 NSG not attached · TC06 public DNS"],
    ["Encryption, logging", "TC07 TLS 1.0 storage · TC08 NSG diagnostics removed"],
    ["Secrets", "TC09 credential in an unused local · TC15 password default"],
    ["Identity", "TC10 wildcard role · TC11 wildcard vs documented needs · TC13 Contributor vs Reader"],
    ["Acceptable", "TC01 secure baseline · TC12 intended public HTTPS · TC14 SSH from one address"],
  ];
  const tcRows = [[tcHdr("Category"), tcHdr("15 test cases: 12 vulnerable, 3 acceptable")]];
  tc.forEach(([a, b], i) => {
    const fill = { color: i % 2 === 0 ? C.background1 : C.background2 };
    tcRows.push([tcCell(a, { bold: true, fill, color: i === 4 ? C.accent4 : C.text2 }), tcCell(b, { fill })]);
  });
  const tblW = 7.05;
  s.addTable(tcRows, { x: L, y: 3.65, w: tblW, colW: [1.85, tblW - 1.85], fontSize: 13, valign: "middle", margin: [0.04, 0.1, 0.04, 0.1],
    border: { type: "solid", pt: 0.75, color: LINE }, rowH: [0.36, 0.52, 0.36, 0.36, 0.52, 0.52], lang: LANG, objectName: "Test case table" });
  const ix = L + tblW + 0.3, iw = R - ix;
  iconCard(s, ix, 3.65, iw, 1.62, "FaFingerprint", C.accent1, "Independence check",
    "Early AI runs saw scanner findings in their prompt. I fixed the workflow (PR #69), ran every case independently and checked all 46 runs’ metadata.",
    { cardFill: C.text2, headColor: C.background1, bodyColor: C.background1, d: 0.5 });
  iconCard(s, ix, 5.45, iw, 1.15, "FaUserShield", C.accent4, "Ethics",
    "Synthetic code, dummy secrets, documentation IPs; nothing deployed; no personal data.", { d: 0.5, headSize: 14, bodySize: 13 });
  s.addNotes(NOTES[4]);

  // ===== 6 RQ1 =====
  pres.addSection({ title: "Results" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ1: the AI detected more than both scanners");
  s.addChart(pres.charts.BAR, [{ name: "Vulnerable cases detected", labels: ["Checkov", "tfsec", "Scanners combined", "AI reviewer\n(+1 partial)"], values: [5, 4, 8, 11] }], {
    x: L, y: 1.4, w: 6.3, h: 4.85, barDir: "col", barGapWidthPct: 55,
    chartColors: [H.accent2, H.accent2, H.dk2, H.accent1],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: H.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 13, catAxisLabelColor: H.dk1,
    valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 12, valAxisLabelColor: "5B6670",
    valAxisMinVal: 0, valAxisMaxVal: 12, valAxisMajorUnit: 3, valGridLine: { color: "E1E6EC", size: 0.75 }, catGridLine: { style: "none" },
    showLegend: false, showTitle: true, title: "Vulnerable cases detected (of 12)", titleFontFace: "+mn-lt", titleFontSize: 13, titleColor: H.dk2,
    lang: LANG, objectName: "Detection chart",
  });
  const c6x = 7.25, c6w = R - c6x;
  [
    ["FaMagnifyingGlass", C.accent1, "Found only by the AI", "TC09 and TC15 (hard-coded secrets) and TC13 (a role judged against a separate requirements file)."],
    ["FaCodeCompare", C.accent2, "The scanners barely overlapped", "Only TC07 was caught by both. Checkov passed rules open to 0.0.0.0/0 but failed the same rule written as *."],
    ["FaTriangleExclamation", C.accent5, "But the AI over-reported", "3 of 9 runs on acceptable cases raised a finding. 82% of the 45 findings it posted were correct (89% if three fixture issues count)."],
  ].forEach(([ic, fill, head, body], i) => iconCard(s, c6x, 1.45 + i * 1.6, c6w, 1.45, ic, fill, head, body));
  txt(s, "Descriptive results for 15 constructed cases; the whole gap comes from TC09, TC13 and TC15, which no scanner rule covers. AI detection = target confirmed in every run (34 of 37 runs); TC08 partial = raised in all 4 runs, shown in 1.",
    { x: L, y: 6.33, w: CW, h: 0.5, fontSize: 11, italic: true, color: C.accent6, objectName: "Caveat" });
  s.addNotes(NOTES[5]);

  // ===== 7 RQ2 + RQ3 =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ2 and RQ3: useful advice, but some false claims");
  const lw7 = 5.65;
  label(s, "RQ2 · Did the AI’s fixes work?", L, 1.45, lw7);
  [
    ["12 / 12", C.accent4, "fixes resolved the target and passed validation; 8 also confirmed by a scanner"],
    ["9 / 12", C.accent2, "fixes where a fresh AI review no longer raised the problem (a stale comment tripped two of the rest)"],
    ["1", C.accent1, "fix, for a false finding, made the Terraform invalid (TC10)"],
  ].forEach(([big, col, lab], i) => {
    const y = 1.85 + i * 1.18;
    txt(s, big, { x: L, y, w: 1.85, h: 0.85, fontSize: 40, bold: true, color: col, valign: "middle", objectName: "Stat " + big });
    txt(s, lab, { x: L + 1.95, y, w: lw7 - 1.95, h: 0.85, valign: "middle", objectName: "Stat label " + (i + 1) });
  });
  box(s, L, 5.5, lw7, 0.95, { fill: C.background2, name: "Validate error card" });
  txt(s, [run("terraform validate, after applying the AI’s tag fix to TC10", { fontSize: 11, color: C.accent6, breakLine: true }),
    run("An argument named \"tags\" is not expected here", { fontSize: 13, color: C.accent1, bold: true, fontFace: MONO })],
    { x: L + 0.2, y: 5.5, w: lw7 - 0.4, h: 0.95, valign: "middle", paraSpaceAfter: 3, objectName: "Validate error" });
  const rx7 = 6.75, rw7 = R - rx7;
  label(s, "RQ3 · Do AI comments help understanding?", rx7, 1.45, rw7);
  s.addChart(pres.charts.BAR, [{ name: "Mean score (0–2)", labels: ["Explanation accuracy", "Developer usefulness", "Remediation", "Impact", "Detection", "Context awareness"], values: [1.65, 1.76, 1.89, 1.89, 1.89, 1.97] }], {
    x: rx7, y: 1.75, w: rw7, h: 3.05, barDir: "bar", barGapWidthPct: 45,
    chartColors: [H.accent1, H.accent2, H.accent2, H.accent2, H.accent2, H.accent2],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: H.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 13, catAxisLabelColor: H.dk1,
    valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 12, valAxisLabelColor: "5B6670", valAxisLabelFormatCode: "0.0",
    valAxisMinVal: 0, valAxisMaxVal: 2, valAxisMajorUnit: 0.5, valGridLine: { color: "E1E6EC", size: 0.75 }, catGridLine: { style: "none" },
    showLegend: false, showTitle: true, title: "Average score out of 2 (37 runs)", titleFontFace: "+mn-lt", titleFontSize: 13, titleColor: H.dk2,
    lang: LANG, objectName: "Rubric chart",
  });
  txt(s, [run("Likely to help: ", { bold: true, color: C.accent4 }),
    run("in plain English, the AI said what was wrong, why it matters and how to fix it. Scanners gave a rule and a short line.", { breakLine: true }),
    run("Risk: ", { bold: true, color: C.accent1 }), run("explanation accuracy scored lowest, because some confident claims were false (Ji et al., 2023).")],
    { x: rx7, y: 4.95, w: rw7, h: 1.2, paraSpaceAfter: 6, objectName: "RQ3 takeaway" });
  txt(s, "Scored once, with AI help; the reason for each score is recorded.",
    { x: rx7, y: 6.3, w: rw7, h: 0.3, fontSize: 11, italic: true, color: C.accent6, objectName: "Scoring caveat" });
  s.addNotes(NOTES[6]);

  // ===== 8 RQ4 =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  title(s, "RQ4: code comments changed the AI’s verdict");
  const lx8 = L, lw8 = 7.05;
  const variant = (y, h, tag, head, code, codeH, pill, pillFill, finding, extra) => {
    box(s, lx8, y, lw8, h, { fill: C.background1, line: LINE, lineW: 1, shadow: true, name: tag + " card" });
    txt(s, [run(tag + "  ", { bold: true, color: C.accent1 }), run(head, { bold: true, color: C.text2 })],
      { x: lx8 + 0.25, y: y + 0.14, w: lw8 - 0.5, h: 0.32, fontSize: 15, objectName: tag + " heading" });
    box(s, lx8 + 0.25, y + 0.52, lw8 - 0.5, codeH, { fill: C.background2, radius: 0.04, name: tag + " code box" });
    txt(s, [run(code, { color: C.accent4, breakLine: true }), run("source_address_prefix = \"203.0.113.10/32\"")],
      { x: lx8 + 0.4, y: y + 0.52, w: lw8 - 0.8, h: codeH, fontSize: 11, fontFace: MONO, valign: "middle", objectName: tag + " code" });
    const py = y + 0.52 + codeH + 0.2;
    box(s, lx8 + 0.25, py, 1.55, 0.36, { fill: pillFill, radius: 0.18, name: tag + " verdict pill" });
    txt(s, pill, { x: lx8 + 0.25, y: py, w: 1.55, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", objectName: tag + " verdict" });
    txt(s, [run(finding, extra ? { breakLine: true } : {})].concat(extra ? [run(extra, { italic: true, color: C.accent6, fontSize: 12 })] : []),
      { x: lx8 + 2.0, y: py - 0.04, w: lw8 - 2.25, h: y + h - py - 0.06, fontSize: 13, objectName: tag + " finding" });
  };
  variant(1.45, 2.15, "(a)", "AI’s own fix, old comment left in place · PR #85", "# TC02: Deliberately unrestricted SSH access", 0.55,
    "HIGH · 70/100", C.accent1, "“SSH allow rule references a documentation-reserved (RFC 5737 TEST-NET-3) source address”", "…and it quoted the stale comment as evidence");
  variant(3.75, 2.45, "(b)", "Same fix, only the comment corrected · PR #98", "# TC02 remediated: SSH restricted to the approved administration address.", 0.78,
    "LOW · 95/100", C.accent4, "“SSH allow rule applies to all subnet destinations rather than a specific target resource”", "Verdict: APPROVE");
  txt(s, "Same Terraform, different comment, different verdict (one review each; TC03 behaved the same way). Comments are untrusted input (Greshake et al., 2023). Figure 4.6.",
    { x: lx8, y: 6.28, w: lw8, h: 0.45, fontSize: 11, italic: true, color: C.accent6, objectName: "Comment caption" });
  const rx8 = 7.95, rw8 = R - rx8;
  [
    ["FaShuffle", C.accent5, "Same input, different answers", "TC08 classified three ways in four runs; TC05 rated HIGH, HIGH, MEDIUM (Ouyang et al., 2025)."],
    ["FaEyeSlash", C.accent1, "Findings hidden or skipped", "NEEDS_CONTEXT findings never reach the comment; deletion-only PRs skip the AI step."],
    ["FaStopwatch", C.accent2, "Small time cost", "AI median 31.5 s of a 77 s job; comments posted in under two minutes."],
  ].forEach(([ic, fill, head, body], i) => iconCard(s, rx8, 1.45 + i * 1.6, rw8, 1.45, ic, fill, head, body, { d: 0.52, headSize: 15 }));
  s.addNotes(NOTES[7]);

  // ===== 9 Evaluation =====
  pres.addSection({ title: "Evaluation and conclusion" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evaluation and conclusion" });
  title(s, "Evaluation: what holds up, and its limits");
  const colw9 = (CW - 2 * 0.3) / 3;
  [
    ["FaCircleCheck", C.accent4, "What holds up", [
      "Scanner coverage depends on rules; Checkov and tfsec complemented each other",
      "The AI found context-dependent and semantic problems the scanners could not",
      "Its errors were less predictable: it varied between identical runs and was steered by comments",
    ]],
    ["FaTriangleExclamation", C.accent5, "Limits", [
      "15 constructed cases, one cloud, one model, one prompt",
      "Cases partly chosen where scanner rules were weak; such sets can flatter AI (Ding et al., 2025)",
      "Fixture comments may have cued the AI; only the AI got the policy file",
      "Single-rater, AI-assisted scoring; three runs show variation but cannot measure it",
    ]],
    ["FaLightbulb", C.accent1, "What I learned", [
      "My first “AI-only” results were scanner-informed; I fixed the workflow and ran every case independently",
      "A result counts only when tied to a run, a commit and the raw output",
      "Next time: prove independence first, strip comments, pin every version, add a second scorer",
    ]],
  ].forEach(([ic, fill, head, items], i) => {
    const x = L + i * (colw9 + 0.3);
    box(s, x, 1.45, colw9, 4.35, { fill: C.background2, name: head + " column" });
    circleIcon(s, ic, "FFFFFF", x + 0.25, 1.65, 0.58, fill, { name: head });
    txt(s, head, { x: x + 1.0, y: 1.65, w: colw9 - 1.2, h: 0.58, fontSize: 18, bold: true, color: C.text2, valign: "middle", objectName: head + " heading" });
    txt(s, items.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, lang: LANG, breakLine: j < items.length - 1 } })),
      { x: x + 0.25, y: 2.43, w: colw9 - 0.45, h: 3.3, fontSize: 14, paraSpaceAfter: 9, objectName: head + " points" });
  });
  const objs = [["O1", "Literature reviewed"], ["O2", "Pipeline built"], ["O3", "Evaluated, within sample limits"], ["O4", "Benefits and limits found"]];
  const ow = (CW - 3 * 0.2) / 4;
  objs.forEach(([k, v], i) => {
    const x = L + i * (ow + 0.2);
    box(s, x, 6.0, ow, 0.55, { fill: C.background1, line: H.accent4, lineW: 1.25, name: k + " objective" });
    circleIcon(s, "FaCheck", "FFFFFF", x + 0.11, 6.085, 0.38, C.accent4, { name: k + " check", pad: 0.24 });
    txt(s, [run(k + "  ", { bold: true, color: C.accent4 }), run(v)], { x: x + 0.58, y: 6.0, w: ow - 0.65, h: 0.55, fontSize: 13, valign: "middle", objectName: k + " text" });
  });
  s.addNotes(NOTES[8]);

  // ===== 10 Conclusion + references =====
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Evaluation and conclusion" });
  title(s, "Conclusion: an advisor beside scanners, not a gate");
  const lw10 = 7.05;
  box(s, L, 1.45, lw10, 1.42, { fill: C.text2, name: "Answer card" });
  txt(s, [run("A qualified yes. ", { bold: true, color: C.background1 }),
    run("On 15 controlled cases the AI improved coverage (11 of 12 plus 1 partial, against 8 for both scanners), but its errors were less predictable. It should advise beside the scanners, not decide merges.", { color: C.background1 })],
    { x: L + 0.3, y: 1.45, w: lw10 - 0.6, h: 1.42, fontSize: 15, valign: "middle", objectName: "Answer" });
  label(s, "Recommendations", L, 3.1, 4);
  const recs = [
    "Scanners enforce; the AI advises and never blocks or approves",
    "Run more than one scanner, or check rule coverage",
    "Treat comments and pull-request text as untrusted input",
    "Show uncertain AI findings instead of hiding them",
    "Validate AI fixes automatically before suggesting them",
    "Review deletion-only changes; log model version and settings",
  ];
  txt(s, recs.map((t, j) => ({ text: t, options: { bullet: { type: "number" }, lang: LANG, breakLine: j < recs.length - 1 } })),
    { x: L, y: 3.42, w: lw10, h: 2.1, paraSpaceAfter: 4, objectName: "Recommendations" });
  box(s, L, 5.65, lw10, 0.9, { fill: C.background2, name: "Further research card" });
  circleIcon(s, "FaFlaskVial", "FFFFFF", L + 0.18, 5.84, 0.52, C.accent2, { name: "Further research" });
  txt(s, [run("Further research: ", { bold: true, color: C.text2 }), run("real Terraform changes mined from public repositories; many runs across models; a comment-manipulation study; a study with developers")],
    { x: L + 0.85, y: 5.65, w: lw10 - 1.0, h: 0.9, fontSize: 13, valign: "middle", objectName: "Further research text" });
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
  await setLanguage(OUT); // UK English proofing for slide numbers and speaker notes too
  console.log("Wrote", OUT);
}
async function setLanguage(file) {
  const fs = require("fs");
  const JSZip = require("/opt/npm-tools/node_modules/jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const names = Object.keys(zip.files).filter((n) => /^ppt\/(slides|notesSlides|slideLayouts|slideMasters|notesMasters)\/[^/]+\.xml$/.test(n) || n === "ppt/presentation.xml");
  for (const n of names) {
    const x = await zip.file(n).async("string");
    // UK English proofing; and title placeholders in PowerPoint's own form (<p:ph type="title"/>, no idx)
    // so every tool recognises the slide titles, not only PowerPoint
    const y = x.replace(/lang="en-US"/g, 'lang="en-GB"')
      .replace(/<p:ph\b[^>]*\btype="title"[^>]*>/g, (m) => m.replace(/\s+idx="\d+"/, ""));
    if (y !== x) zip.file(n, y);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
build().catch((e) => { console.error(e); process.exit(1); });
