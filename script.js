let dict = [];

fetch('conlang_dict.json')
  .then(res => res.json())
  .then(data => {
    dict = data;
    viewAll();
  })
  .catch(err => {
    document.getElementById("dictionary").innerHTML = `<p style="color:red;">Error loading dictionary: ${err.message}</p>`;
    console.error(err);
  });

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z']/g, '');
}

function filterWords() {
  const term = normalize(document.getElementById("search").value.trim());
  if (!term) {
    viewAll();
    return;
  }
  const filtered = dict.filter(w =>
    normalize(w.english).includes(term) ||
    normalize(w.conlang).includes(term)
  );
  displayWords(filtered);
}

function viewAll() {
  document.getElementById("search").value = "";
  displayWords(dict);
}

function displayWords(words) {
  const output = document.getElementById("dictionary");
  const wordCount = document.getElementById("wordCount");
  output.innerHTML = "";
  wordCount.textContent = `Total words: ${words.length}`;

  const byCategory = {};
  const shown = new Set();

  words.forEach(entry => {
    const cat = entry.category.toLowerCase();
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(entry);
  });

  for (const cat in byCategory) {
    const catDiv = document.createElement("div");
    catDiv.innerHTML = `<h2>${cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>`;
    const group = byCategory[cat];

    group.forEach(entry => {
      if (shown.has(entry.conlang)) return;

      if (!entry.root) {
        const line = document.createElement("div");
        line.textContent = `${capitalize(entry.english)} - ${entry.conlang}`;
        line.style.marginLeft = "10px";
        catDiv.appendChild(line);
        shown.add(entry.conlang);

        const derived = group.filter(w => w.root === entry.conlang);
        derived.forEach(child => {
          const sub = document.createElement("div");
          sub.textContent = `→ ${capitalize(child.english)} - ${child.conlang}`;
          sub.className = "root";
          catDiv.appendChild(sub);
          shown.add(child.conlang);
        });
      }
    });

    // Show any left-over words (with roots that may be missing base)
    group.forEach(entry => {
      if (!shown.has(entry.conlang)) {
        const solo = document.createElement("div");
        solo.textContent = `${capitalize(entry.english)} - ${entry.conlang}`;
        solo.style.marginLeft = "10px";
        catDiv.appendChild(solo);
        shown.add(entry.conlang);
      }
    });

    output.appendChild(catDiv);
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
