<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Biblioteca Virtual - Prova T3</title>
  <style>
    /* --- layout: form à direita, lista vertical --- */
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { display: flex; gap: 20px; align-items: flex-start; }
    /* área lista/biblioteca */
    #biblioteca { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 8px; min-height: 200px; }
    #bibliotecaItens { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .item { padding: 8px; border: 1px solid #eee; border-radius: 6px; background: #fafafa; }
    /* formulário posicionado à direita */
    #formArea { width: 320px; border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
    label { display:block; margin-top:8px; font-size:14px; }
    input[type="text"], input[type="email"] { width:100%; padding:6px; margin-top:4px; box-sizing:border-box; }
    button { margin-top:10px; padding:8px 10px; cursor:pointer; border-radius:6px; }
    /* cabeçalhos de status (carregando / erro) */
    #carregamento, #erro { color: #333; margin: 0 0 10px 0; }
    #erro { color: darkred; }
    /* footer */
    footer { margin-top: 24px; text-align:center; font-size:14px; color:#666; border-top:1px solid #eee; padding-top:10px; }
  </style>
</head>
<body>

  <h1>Biblioteca Virtual — Prova do 3º trimestre</h1>

  <!-- elementos obrigatórios solicitados -->
  <h3 id="carregamento" style="display: none;">Carregando itens da biblioteca...</h3>
  <h3 id="erro" style="display: none;"></h3>

  <div class="container">
    <!-- área da biblioteca (lista) -->
    <div id="biblioteca">
      <!-- elemento opcional: mostrar total de itens -->
      <p id="totalItens">Total de itens: 0</p>

      <!-- lista de itens (vertical) -->
      <div id="bibliotecaItens"></div>
    </div>

    <!-- formulário (posicionado à direita via CSS) -->
    <div id="formArea">
      <h3>Adicionar item</h3>
      <label for="titulo">Título</label>
      <input id="titulo" type="text" placeholder="Título do livro" />

      <label for="autor">Autor</label>
      <input id="autor" type="text" placeholder="Nome do autor" />

      <label for="email">Seu e-mail</label>
      <input id="email" type="email" placeholder="seu@email.com" />

      <button id="btnAdicionar">Adicionar</button>
      <button id="btnExemplo" type="button">Inserir valores de exemplo</button>
    </div>
  </div>

  <!-- rodapé conforme opcional 4 -->
  <footer>
    Projeto feito por <a href="mailto:seu.nome@exemplo.com" id="meuLink">Seu Nome</a>
  </footer>

<script>
/* ==== Variáveis globais (úteis para as funções pedidas) ==== */
const biblioteca = document.getElementById('biblioteca');      // usado nos "bônus"
let bibliotecaItens = []; // array que guarda objetos recebidos do servidor

/* ----------------- Funções obrigatórias ----------------- */
/* 1) mostrarErro(mensagem) */
function mostrarErro(mensagem) {
  const elemento = document.getElementById('erro');
  elemento.textContent = mensagem;
  elemento.style.display = 'block';
}

/* 2) esconderErro() */
function esconderErro() {
  const elemento = document.getElementById('erro');
  elemento.style.display = 'none';
}

/* 3) mostrarCarregamento() -- bônus: também esconde a biblioteca */
function mostrarCarregamento() {
  const elemento = document.getElementById('carregamento');
  elemento.style.display = 'block';
  // bônus
  biblioteca.style.display = 'none';
}

/* 4) esconderCarregamento() -- bônus: também mostra a biblioteca */
function esconderCarregamento() {
  const elemento = document.getElementById('carregamento');
  elemento.style.display = 'none';
  // bônus: voltar a mostrar a biblioteca
  biblioteca.style.display = 'block';
}

/* ------------- Funções auxiliares para a demo / prova ------------- */

/* renderiza a lista na tela e atualiza o contador (atividade opcional 1) */
function renderizarLista() {
  const container = document.getElementById('bibliotecaItens');
  container.innerHTML = ''; // limpa
  bibliotecaItens.forEach((obj, idx) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = `${obj.titulo} — ${obj.autor}`;
    container.appendChild(div);
  });

  // atualizar contador: atividade livre-escolha 1
  const total = document.getElementById('totalItens');
  total.textContent = `Total de itens: ${bibliotecaItens.length}`;
}

/* Simula carregamento de itens do servidor (use esta função para testar carregarItens) */
function carregarItensSimulados() {
  mostrarCarregamento();
  esconderErro();

  // simula requisição com setTimeout
  setTimeout(() => {
    try {
      // exemplo: itens recebidos do "servidor"
      bibliotecaItens = [
        { titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
        { titulo: '1984', autor: 'George Orwell' },
        { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry' }
      ];
      renderizarLista();
      esconderCarregamento();
    } catch (e) {
      esconderCarregamento();
      mostrarErro('Erro ao carregar itens: ' + (e.message || e));
    }
  }, 900); // intervalo pequeno para demo
}

/* Adicionar item (quando botão for clicado) */
document.getElementById('btnAdicionar').addEventListener('click', () => {
  const titulo = document.getElementById('titulo').value.trim();
  const autor = document.getElementById('autor').value.trim();
  if (!titulo || !autor) {
    mostrarErro('Preencha título e autor antes de adicionar.');
    return;
  }
  esconderErro();
  bibliotecaItens.push({ titulo, autor });
  renderizarLista();
  // limpar inputs
  document.getElementById('titulo').value = '';
  document.getElementById('autor').value = '';
});

/* Botão inserir valores de exemplo (atividade opcional 3) */
document.getElementById('btnExemplo').addEventListener('click', () => {
  // preenche os campos do formulário com valores de exemplo
  document.getElementById('titulo').value = 'Exemplo: Programação em JS';
  document.getElementById('autor').value = 'Fulano de Tal';
  document.getElementById('email').value = 'fulano@exemplo.com';
});

/* Carrega itens assim que a página abrir (substitui a função carregarItens da sua aplicação) */
window.addEventListener('load', () => {
  carregarItensSimulados(); // use a função real "carregarItens" se já existir no seu projeto
});

/* Observação: caso sua aplicação já tenha uma função carregarItens que faz fetch
   do servidor, chame as funções mostrarCarregamento() / esconderCarregamento()
   dentro desse fluxo para integrar com o que você já fez. */

/* Fim do script */
</script>
</body>
</html>

