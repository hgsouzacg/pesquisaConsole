(async () => {
  const TERMO = "ppc";          // termo procurado
  const PAGINA_INICIAL = 1;
  const PAGINA_FINAL = 30;
  const PALAVRA_INTEIRA = false; // true = só "ppc" isolado, não "ppcs" ou "xppcx"

  const escapado = TERMO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(PALAVRA_INTEIRA ? `\\b${escapado}\\b` : escapado, "i");
  const paginasComTermo = [];

  for (let page = PAGINA_INICIAL; page <= PAGINA_FINAL; page++) {
    const url = `https://suap.ifrn.edu.br/demandas/atualizacoes/?page=${page}`;
    try {
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) { console.warn(`Página ${page}: HTTP ${resp.status}`); continue; }
      const doc = new DOMParser().parseFromString(await resp.text(), "text/html");

      if (regex.test(doc.body.innerText || doc.body.textContent)) {
        // #:~:text= faz o navegador rolar até o termo e destacá-lo ao abrir
        paginasComTermo.push(`${url}#:~:text=${encodeURIComponent(TERMO)}`);
        console.log(`✔ Página ${page}: encontrado`);
      } else {
        console.log(`– Página ${page}: nada`);
      }
    } catch (e) {
      console.error(`Erro na página ${page}`, e);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Concluído: ${paginasComTermo.length} página(s) com "${TERMO}"`);
  console.log(paginasComTermo.join("\n"));

  if (!paginasComTermo.length) return;

  // O navegador só permite abrir várias abas a partir de um clique do usuário,
  // então mostro um botão flutuante para isso.
  document.getElementById("painel-ppc")?.remove();
  const painel = document.createElement("div");
  painel.id = "painel-ppc";
  painel.style.cssText =
    "position:fixed;top:16px;right:16px;z-index:999999;background:#fff;color:#222;" +
    "border:2px solid #2a7;border-radius:8px;padding:12px;font:14px sans-serif;" +
    "box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:320px;max-height:70vh;overflow:auto";

  const btn = document.createElement("button");
  btn.textContent = `Abrir ${paginasComTermo.length} página(s) com "${TERMO}"`;
  btn.style.cssText = "cursor:pointer;padding:8px 12px;margin-bottom:8px;width:100%";
  btn.onclick = () => paginasComTermo.forEach(u => window.open(u, "_blank"));

  const fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  fechar.style.cssText = "cursor:pointer;padding:4px 8px;width:100%;margin-bottom:8px";
  fechar.onclick = () => painel.remove();

  const lista = document.createElement("ul");
  lista.style.cssText = "margin:0;padding-left:18px";
  paginasComTermo.forEach(u => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = u; a.target = "_blank";
    a.textContent = "Página " + new URL(u).searchParams.get("page");
    li.appendChild(a);
    lista.appendChild(li);
  });

  painel.append(btn, fechar, lista);
  document.body.appendChild(painel);
})();