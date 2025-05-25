let dict = [];

fetch('conlang_dict.json')
  .then(res => res.json())
  .then(data => {
    dict = data;
    viewAll();
  })
  .catch(err => {
    document.getElementById("dictionary").innerHTML = `<p style="color:red;">Error loading dictionary: ${err.message}</p>`;
  });

function viewAll() {
  document.getElementById("search").value = "";
  displayWords(dict);
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

function filterWords() {
  const term = normalize(document.getElementById("search").value.trim());
  const filtered = dict.filter(w =>
    normalize(w.english).includes(term) ||
    normalize(w.conlang).includes(term)
  );
  displayWords(filtered);
}

function displayWords(words) {
  const output = document.getElementById("dictionary");
  const wordCount = document.getElementById("wordCount");
  output.innerHTML = "";
  wordCount.textContent = `Total words: ${words.length}`;

  const byCategory = {};
  const shown = new Set();

  words.forEach(entry => {
    const category = entry.category.toLowerCase();
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(entry);
  });

  for (const category in byCategory) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.innerHTML = `<h2>${capitalize(category)}</h2>`;

    const group = byCategory[category];

    group.forEach(entry => {
      if (shown.has(entry.conlang)) return;

      if (!entry.root) {
        const line = document.createElement("div");
        line.className = "word";
        line.textContent = `${capitalize(entry.english)} - ${entry.conlang}`;
        catDiv.appendChild(line);
        shown.add(entry.conlang);

        const derived = group.filter(w => w.root === entry.conlang);
        derived.forEach(child => {
          const sub = document.createElement("div");
          sub.className = "root";
          sub.textContent = `→ ${capitalize(child.english)} - ${child.conlang}`;
          catDiv.appendChild(sub);
          shown.add(child.conlang);
        });
      }
    });

    // Also show standalone root words not shown yet
    group.forEach(entry => {
      if (!shown.has(entry.conlang)) {
        const solo = document.createElement("div");
        solo.className = "word";
        solo.textContent = `${capitalize(entry.english)} - ${entry.conlang}`;
        catDiv.appendChild(solo);
        shown.add(entry.conlang);
      }
    });

    output.appendChild(catDiv);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
