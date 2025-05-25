let dict = [];

fetch('conlang_dict.json')
  .then(res => {
    if (!res.ok) throw new Error("Failed to load JSON");
    return res.json();
  })
  .then(data => {
    dict = data.map(entry => ({
      ...entry,
      english: entry.english.toLowerCase(),
      conlang: entry.conlang.toLowerCase(),
      category: entry.category.toLowerCase(),
      root: entry.root ? entry.root.toLowerCase() : null
    }));
    displayAllWords(dict);
  })
  .catch(err => {
    document.getElementById("dictionary").innerHTML = `<p style="color:red;">Error loading dictionary: ${err.message}</p>`;
  });

function displayAllWords(data) {
  const output = document.getElementById("dictionary");
  output.innerHTML = "";

  const grouped = {};
  data.forEach(entry => {
    const cat = entry.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  });

  for (let cat in grouped) {
    const section = document.createElement("div");
    section.className = "category";
    section.innerHTML = `<h2>${capitalize(cat)}</h2>`;

    grouped[cat].forEach(word => {
      const line = document.createElement("div");
      line.className = "word";
      line.textContent = `${capitalize(word.english)} - ${word.conlang}`;
      section.appendChild(line);

      // Show subwords that have this word as root
      const subwords = dict.filter(w => w.root === word.conlang);
      subwords.forEach(sub => {
        const rootLine = document.createElement("div");
        rootLine.className = "root";
        rootLine.textContent = `→ ${capitalize(sub.english)} - ${sub.conlang}`;
        section.appendChild(rootLine);
      });
    });

    output.appendChild(section);
  }
}

function filterWords() {
  const term = document.getElementById("search").value.toLowerCase();
  const filtered = dict.filter(w =>
    w.english.includes(term) || w.conlang.includes(term)
  );
  displayAllWords(filtered);
}

function viewAll() {
  document.getElementById("search").value = "";
  displayAllWords(dict);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}