// ---------- Produtos por empreendimento ----------
const produtosPorEmpreendimento = {
    farmacia: [
        "Amoxicilina 250mg", "Amoxicilina 500mg", "Amoxicilina 875mg",
        "Azitromicina 250mg", "Azitromicina 500mg",
        "Cefalexina 250mg", "Cefalexina 500mg",
        "Dipirona 500mg", "Dipirona 1g",
        "Ibuprofeno 200mg", "Ibuprofeno 400mg", "Ibuprofeno 600mg",
        "Losartana 25mg", "Losartana 50mg", "Losartana 100mg",
        "Metformina 500mg", "Metformina 850mg",
        "Omeprazol 10mg", "Omeprazol 20mg", "Omeprazol 40mg",
        "Paracetamol 325mg", "Paracetamol 500mg", "Paracetamol 750mg",
        "Rivotril 0.5mg", "Rivotril 2mg",
        "Sinvastatina 10mg", "Sinvastatina 20mg"
    ].sort(),
    refrigeracao: [
        "Geladeira 250L", "Geladeira 350L", "Geladeira 500L",
        "Freezer 200L", "Freezer 300L",
        "Ar Condicionado Split 9000 BTUs", "Ar Condicionado Split 12000 BTUs",
        "Ventilador de Mesa", "Ventilador de Teto",
        "Climatizador Evaporativo"
    ].sort()
};


// ---------- Estado ----------
let tipoSelecionado = null;
let produtosAtuais = [];
const etapa1 = document.getElementById("etapa1");
const etapa2 = document.getElementById("etapa2");
const etapa3 = document.getElementById("etapa3");
const listaProdutosEl = document.getElementById("lista-produtos");
const resultadoEl = document.getElementById("resultado");

// ---------- Inicialização ----------
window.addEventListener("load", () => {
    const savedData = JSON.parse(localStorage.getItem("listaRepor")) || null;
    if (savedData) {
        tipoSelecionado = savedData.tipo;
        produtosAtuais = produtosPorEmpreendimento[tipoSelecionado];
        document.getElementById("empreendimento").value = tipoSelecionado;
        etapa1.classList.add("hidden");
        etapa2.classList.remove("hidden");
        montarListaProdutos();

        // Restaurar quantidades salvas
        savedData.qtds.forEach((qtd, i) => {
            const input = document.getElementById(`qtd-${i}`);
            if (input) input.value = qtd;
        });
    }
});

document.getElementById("btnVoltarLista").addEventListener("click", ()=>{
  etapa3.classList.add("hidden");
  etapa2.classList.remove("hidden");
});


// ---------- Eventos ----------
document.getElementById("btnContinuar").addEventListener("click", () => {
    tipoSelecionado = document.getElementById("empreendimento").value;
    if (!tipoSelecionado) { alert("Selecione um empreendimento."); return; }
    produtosAtuais = produtosPorEmpreendimento[tipoSelecionado];
    etapa1.classList.add("hidden");
    etapa2.classList.remove("hidden");
    montarListaProdutos();
    salvarLocalStorage();
});

document.getElementById("btnVoltar").addEventListener("click", voltar);
document.getElementById("btnResetar").addEventListener("click", () => {
    if (confirm("Deseja reiniciar todas as quantidades?")) {
        produtosAtuais.forEach((_, i) => {
            const input = document.getElementById(`qtd-${i}`);
            if (input) input.value = "0";
        });
        salvarLocalStorage();
    }
});
document.getElementById("btnGerar").addEventListener("click", gerarLista);
document.getElementById("btnCopiar").addEventListener("click", copiarTexto);
document.getElementById("btnNova").addEventListener("click", () => {
    if (confirm("Deseja reiniciar tudo e começar uma nova lista?")) {
        localStorage.removeItem("listaRepor");
        location.reload();
    }
});

// ---------- Funções ----------
function montarListaProdutos() {
    listaProdutosEl.innerHTML = "";
    produtosAtuais.forEach((produto, i) => {
        const div = document.createElement("div");
        div.className = "produto";
        div.innerHTML = `
      <span>${produto}</span>
      <div class="contador">
        <button onclick="alterarQtd(${i},-1)">-</button>
        <input type="text" id="qtd-${i}" value="0" oninput="validarQtd(${i})">
        <button onclick="alterarQtd(${i},1)">+</button>
      </div>
    `;
        listaProdutosEl.appendChild(div);
    });
}

function alterarQtd(index, delta) {
    const input = document.getElementById(`qtd-${index}`);
    let val = parseInt(input.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    if (val > 1000) val = 1000;
    input.value = val;
    salvarLocalStorage();
}

function validarQtd(index) {
    const input = document.getElementById(`qtd-${index}`);
    let val = input.value.replace(/\D/g, "");
    if (val === "") val = "0";
    val = parseInt(val);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 1000) val = 1000;
    input.value = val;
    salvarLocalStorage();
}

function salvarLocalStorage() {
    if (!tipoSelecionado) return;
    const qtds = produtosAtuais.map((_, i) => {
        const input = document.getElementById(`qtd-${i}`);
        return input ? parseInt(input.value) || 0 : 0;
    });
    localStorage.setItem("listaRepor", JSON.stringify({
        tipo: tipoSelecionado,
        qtds
    }));
}

function voltar() {
    etapa1.classList.remove("hidden");
    etapa2.classList.add("hidden");
    etapa3.classList.add("hidden");
}

function gerarLista() {
    let texto = `🛒 Lista de Reposição - ${tipoSelecionado}\n\n`;
    let any = false;
    produtosAtuais.forEach((produto, i) => {
        const qtd = parseInt(document.getElementById(`qtd-${i}`).value) || 0;
        if (qtd > 0) { any = true; texto += `- ${produto} (${qtd})\n`; }
    });
    if (!any) { alert("Selecione pelo menos 1 produto."); return; }
    resultadoEl.value = texto;
    etapa2.classList.add("hidden");
    etapa3.classList.remove("hidden");
}

async function copiarTexto() {
    const texto = resultadoEl.value;
    if (!texto) return;
    try {
        await navigator.clipboard.writeText(texto);
        alert("✅ Texto copiado! Agora cole no WhatsApp.");
    } catch (e) {
        resultadoEl.select();
        try { document.execCommand("copy"); alert("✅ Copiado!"); }
        catch { alert("Não foi possível copiar automaticamente. Selecione e copie manualmente."); }
    }
}
