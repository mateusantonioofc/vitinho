const form = document.getElementById("formulario");
const cancelarBtn = document.getElementById("input-cancelar"); //getElementById pega um elemento pelo id
const api = "http://localhost:3000/api/biblioteca"; // url da api (server.js)

class MinhaClasse {
  constructor(nome, idade, altura) {
    this.nome = nome
    this.idade = idade
    this.altura = altura
  }

  dizerOi() {
    console.log(`ola, ${this.nome}`) // use o this para se referir a variaveis da propria classe
  }

  // nomeDaFuncao()
  verificarIdade() {
    if (this.idade < 18) {
      console.log("sai vagabundo de menor")
    } else {
      console.log("bem vindo a casa das primas")
    }
  }
}

const Brunu = new MinhaClasse("Brunu", 10, 143);

console.log(Brunu.altura) // pega a altura
console.log(Brunu.verificarIdade()) // chama a funcao verificarIdade()

// fetch
async function carregarFilmes() {
  const main = document.getElementById("main"); // div no html
  main.innerHTML = "";

  const res = await fetch(api); // fetch envia requisicoes para a api
  const data = await res.json(); // resposta da api

  data.data.forEach((filme) => { // executa o bloco de codigo para cada filme no db
    const card = document.createElement("div"); // cria uma nova div no html
    card.classList.add("card"); // adiciona a tag "card" na div

    // innerHTML edita o conteudo do html
    // ${} - para concatenacao
    card.innerHTML = `
      <img src="${filme.img}" alt="${filme.nome}">
      <div class="card-content">
        <h2>${filme.nome}</h2>
        <p><strong>Ano:</strong> ${filme.ano}</p>
        <p><strong>Nota:</strong> ${filme.nota}</p>
        <p><strong>Gênero:</strong> ${filme.tipo}</p>
        <p><strong>Duração:</strong> ${filme.duracao} min</p>
        <p>${filme.review || ""}</p>
        <a href="${filme.url}" target="_blank" class="btn">Assistir</a>
        <button class="btn" style="margin-top:10px;background:#b00020;" data-id="${filme.id}">Excluir</button>
      </div>
    `;

    main.appendChild(card);
  });

  document.querySelectorAll(".btn[data-id]").forEach((btn) => { // pega todos os botoes do card
    btn.addEventListener("click", apagarFilme); // addEventListener adiciona a acao de click no bota
    // quando o botao for pressionado chama a funcao apagarFilme()
  });
}

async function apagarFilme(e) {
  const id = e.target.getAttribute("data-id");
  /*
    faz um fetch na rota /id
    method - define qual metodo da requisicao
  */
  await fetch(`${api}/${id}`, { 
    method: "DELETE" 
  });

  carregarFilmes(); // chama a funcao carregar filme
}

form.addEventListener("submit", async (e) => { // quando o formulario for enviado
  e.preventDefault();

  /*
    cria um novo objeto com todas as informacoes do filme que sera adicionado
  */
  const novoFilme = {
    nome: document.getElementById("input-nome").value,
    ano: document.getElementById("input-ano").value,
    tipo: document.getElementById("input-genero").value,
    nota: document.getElementById("input-nota").value,
    review: document.getElementById("input-review").value,
    duracao: document.getElementById("input-duracao").value,
    img: document.getElementById("input-img").value || "https://via.placeholder.com/300x450",
    url: document.getElementById("input-url").value || "#"
  };

  /*
    envia as informacoes para a api com o metodo POST
  */
  await fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoFilme)
  });

  form.reset();
  carregarFilmes();
});


// form.reset() - apaga todos os dados do formulario
cancelarBtn.addEventListener("click", () => {
  form.reset();
});

carregarFilmes();
