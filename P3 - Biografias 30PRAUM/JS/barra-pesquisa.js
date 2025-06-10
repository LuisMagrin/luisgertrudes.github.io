const input = document.getElementById("campo-pesquisa");
let highlights = [];
let currentIndex = 0;

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function limparDestaques() {
  document.querySelectorAll(".highlight, .highlight-current").forEach(span => {
    const parent = span.parentNode;
    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  });
  highlights = [];
  currentIndex = 0;
}

function destacarTermo(termo) {
  limparDestaques();
  if (!termo) return;

  const termoNorm = removerAcentos(termo.toLowerCase());
  const regex = new RegExp(termoNorm, "gi");

  function destacarEmElemento(el) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        const textoOriginal = node.nodeValue;
        const textoNorm = removerAcentos(textoOriginal.toLowerCase());

        if (regex.test(textoNorm)) {
          let frag = document.createDocumentFragment();
          let lastIndex = 0;
          regex.lastIndex = 0;
          let match;

          while ((match = regex.exec(textoNorm)) !== null) {
            const start = match.index;
            const end = regex.lastIndex;

            frag.appendChild(document.createTextNode(textoOriginal.slice(lastIndex, start)));

            const span = document.createElement("span");
            span.className = "highlight";
            span.textContent = textoOriginal.slice(start, end);
            frag.appendChild(span);
            highlights.push(span);

            lastIndex = end;
          }

          frag.appendChild(document.createTextNode(textoOriginal.slice(lastIndex)));

          el.replaceChild(frag, node);
          // Não avançar o índice porque modificamos os filhos
          return;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && !["SCRIPT", "STYLE", "INPUT", "TEXTAREA"].includes(node.nodeName)) {
        destacarEmElemento(node);
      }
    }
  }

  destacarEmElemento(document.body);
}

input.addEventListener("input", () => {
  if (input.value.trim() === "") limparDestaques();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const termo = input.value.trim();
    if (!termo) return;

    if (highlights.length === 0) {
      destacarTermo(termo);
      if (highlights.length === 0) {
        alert("Termo não encontrado!");
        return;
      }
    }

    document.querySelectorAll(".highlight-current").forEach(el => el.classList.remove("highlight-current"));

    const el = highlights[currentIndex];
    el.classList.add("highlight-current");
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    currentIndex = (currentIndex + 1) % highlights.length;
  }
});
