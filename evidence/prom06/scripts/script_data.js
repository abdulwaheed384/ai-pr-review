// Slide-by-slide script data shared by the Word file and the read-aloud page.
const S = require('./script_v4.js');
const WPM = 125;
const TITLES = [
  'Title and introduction',
  'Can an AI reviewer catch what scanners miss?',
  'How the literature shaped the study',
  'What I built: three independent reviewers',
  'How I tested it: fixed answers, three runs each',
  'RQ1: the AI found more than the scanners combined',
  'RQ2 and RQ3: useful advice, but some false claims',
  'RQ4: code comments changed the AI’s verdict',
  'Evaluation: what holds up, and its limits',
  'Conclusion: an advisor beside scanners, not a gate',
];
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
let total = 0, words = 0;
const slides = S.map((body, i) => {
  const demoMatch = body.match(/\[Optional demo([^\]]*)\]/);
  const spoken = body.replace(/\n*\[Optional demo[^\]]*\]\n*/, '\n\n');
  const w = spoken.split(/\s+/).filter(Boolean).length;
  const sec = Math.max(30, Math.round(w / WPM * 60 / 5) * 5);
  total += sec; words += w;
  // keep the demo note in its place: split paragraphs around it
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) =>
    /^\[Optional demo/.test(p) ? { note: 'Optional demo' + demoMatch[1].replace(/^,\s*/, ', ').trim() } : { text: p });
  return { n: i + 1, title: TITLES[i], sec, time: fmt(sec), total: fmt(total), words: w, paras };
});
const approxWords = (Math.round(words / 50) * 50).toLocaleString('en-GB');
const approxMinutes = Math.round(total / 60);
module.exports = { slides, totalWords: words, totalTime: fmt(total), WPM, approxWords, approxMinutes };
if (require.main === module) {
  slides.forEach((s) => console.log(s.n, s.time, s.total, s.words, s.paras.map((p) => p.note ? 'NOTE' : 'p').join(',')));
  console.log(words, fmt(total));
  console.log(JSON.stringify(slides[3].paras.find((p) => p.note)));
}
