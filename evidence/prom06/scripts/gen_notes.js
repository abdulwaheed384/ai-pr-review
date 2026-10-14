// Writes notes.js (speaker notes with timings) from script_data.js
const fs = require('fs');
const { slides } = require('./script_data.js');
const raw = require('./script_v4.js');
const notes = slides.map((s, i) => `[Slide ${s.n} · about ${s.time} · ${s.total} in total]\n\n${raw[i]}`);
fs.writeFileSync(__dirname + '/notes.js', '// Speaker notes (script v4, matches the redesigned slides), generated from script_v4.js\nmodule.exports = ' + JSON.stringify(notes, null, 1) + ';\n');
console.log('notes written', notes.length);
