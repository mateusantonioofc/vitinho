document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const formulario = document.getElementById('formulario');
  const recarregarBtn = document.getElementById('recarregar');
  const modalConfirm = document.getElementById('modal-confirm');
  const cancelarDeleteBtn = document.getElementById('cancelar-delete');
  const confirmarDeleteBtn = document.getElementById('confirmar-delete');
  const modalEdit = document.getElementById('modal-edit');
  const cancelarEditBtn = document.getElementById('cancelar-edit');
  const salvarEditBtn = document.getElementById('salvar-edit');
  const editTitulo = document.getElementById('edit-titulo');
  const editAutor = document.getElementById('edit-autor');
  const editAno = document.getElementById('edit-ano');
  const editGenero = document.getElementById('edit-genero');
  const editImagem = document.getElementById('edit-imagem');
  const modalDetalhes = document.getElementById('modal-detalhes');
  const fecharDetalhes = document.getElementById('fechar-detalhes');
  const detalhesImg = document.getElementById('det-img');
  const detalhesTitulo = document.getElementById('det-titulo');
  const detalhesAutor = document.getElementById('det-autor');
  const detalhesAno = document.getElementById('det-ano');
  const detalhesGenero = document.getElementById('det-genero');
  const detalhesRating = document.getElementById('det-rating');
  const buscaInput = document.getElementById('busca');
  const filtroGenero = document.getElementById('filtro-genero');
  const ordenacaoSelect = document.getElementById('ordenacao');
  const paginacaoContainer = document.getElementById('paginacao');
  const contadorItens = document.getElementById('contador');
  const temaToggle = document.getElementById('tema-toggle');

  const API_BASE = 'https://predict-production-40f6.up.railway.app/api/biblioteca';

  let idParaDeletar = null;
  let idParaEditar = null;
  let dadosOriginais = [];
  let paginaAtual = 1;
  let porPagina = 9;

  function openModal(m) { m.classList.remove('hidden'); }
  function closeModal(m) { m.classList.add('hidden'); }

  function toast(msg, tipo = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 2500);
  }

  function ratingLocal(id) {
    return Number(localStorage.getItem(`rating_${id}`)) || 0;
  }

  function salvarRating(id, r) {
    localStorage.setItem(`rating_${id}`, r);
  }

  function criarEstrelas(id) {
    const r = ratingLocal(id);
    const div = document.createElement('div');
    div.className = 'rating';
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.textContent = i <= r ? '★' : '☆';
      s.dataset.valor = i;
      s.addEventListener('click', () => {
        salvarRating(id, i);
        renderizar();
      });
      div.appendChild(s);
    }
    return div;
  }

  function criarSkeleton() {
    const grid = document.createElement('div');
    grid.className = 'manga-grid';
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('div');
      s.className = 'skeleton-card';
      grid.appendChild(s);
    }
    return grid;
  }

  function criarCard(manga) {
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.dataset.id = manga.id;

    const img = document.createElement('img');
    img.src = manga.imagem || '';
    img.onerror = () => img.src = 'https://via.placeholder.com/200x280?text=Sem+Imagem';
    img.addEventListener('click', () => abrirDetalhes(manga));

    const info = document.createElement('div');
    info.className = 'manga-info';

    const titulo = document.createElement('h3');
    titulo.textContent = manga.titulo || 'Sem título';

    const autor = document.createElement('p');
    autor.innerHTML = `<strong>Autor:</strong> ${manga.autor || '-'}`;

    const ano = document.createElement('p');
    ano.innerHTML = `<strong>Ano:</strong> ${manga.ano || '-'}`;

    const genero = document.createElement('p');
    genero.innerHTML = `<strong>Gênero:</strong> ${manga.genero || '-'}`;

    const rating = criarEstrelas(manga.id);

    const btns = document.createElement('div');
    btns.className = 'card-buttons';

    const editarBtn = document.createElement('button');
    editarBtn.className = 'btn-edit';
    editarBtn.textContent = 'Editar';
    editarBtn.addEventListener('click', () => abrirModalEditar(manga.id));

    const deletarBtn = document.createElement('button');
    deletarBtn.className = 'btn-delete';
    deletarBtn.textContent = 'Apagar';
    deletarBtn.addEventListener('click', () => abrirModalDeletar(manga.id));

    btns.appendChild(editarBtn);
    btns.appendChild(deletarBtn);

    info.appendChild(titulo);
    info.appendChild(autor);
    info.appendChild(ano);
    info.appendChild(genero);
    info.appendChild(rating);
    info.appendChild(btns);

    card.appendChild(img);
    card.appendChild(info);

    return card;
  }

  async function carregarDados() {
    main.innerHTML = '';
    main.appendChild(criarSkeleton());
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      dadosOriginais = data.data || [];
      paginaAtual = 1;
      renderizar();
    } catch (e) {
      main.innerHTML = '<p>Erro ao carregar dados</p>';
    }
  }

  function aplicarFiltros(rows) {
    const busca = buscaInput.value.toLowerCase();
    if (busca) {
      rows = rows.filter(m => m.titulo.toLowerCase().includes(busca) || (m.autor || '').toLowerCase().includes(busca));
    }
    const gen = filtroGenero.value;
    if (gen !== 'todos') rows = rows.filter(m => m.genero === gen);
    const ord = ordenacaoSelect.value;
    if (ord === 'az') rows.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (ord === 'za') rows.sort((a, b) => b.titulo.localeCompare(a.titulo));
    if (ord === 'ano_up') rows.sort((a, b) => (a.ano || 0) - (b.ano || 0));
    if (ord === 'ano_down') rows.sort((a, b) => (b.ano || 0) - (a.ano || 0));
    return rows;
  }

  function paginar(rows) {
    const inicio = (paginaAtual - 1) * porPagina;
    return rows.slice(inicio, inicio + porPagina);
  }

  function renderPaginacao(total) {
    paginacaoContainer.innerHTML = '';
    const totalPaginas = Math.ceil(total / porPagina);
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === paginaAtual) btn.classList.add('ativo');
      btn.addEventListener('click', () => {
        paginaAtual = i;
        renderizar();
      });
      paginacaoContainer.appendChild(btn);
    }
  }

  function renderizar() {
    let rows = aplicarFiltros([...dadosOriginais]);
    contadorItens.textContent = `${rows.length} itens`;
    const pag = paginar(rows);

    main.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'manga-grid';

    pag.forEach(m => grid.appendChild(criarCard(m)));
    main.appendChild(grid);

    renderPaginacao(rows.length);
  }

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('input-titulo').value.trim();
    const autor = document.getElementById('input-autor').value.trim();
    const ano = document.getElementById('input-ano').value.trim();
    const genero = document.getElementById('input-genero').value.trim();
    const imagem = document.getElementById('input-img').value.trim();

    const payload = { titulo, autor, ano: ano ? Number(ano) : null, genero, imagem };

    try {
      const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      toast('Mangá adicionado', 'success');
      formulario.reset();
      carregarDados();
    } catch (err) {
      toast('Erro ao adicionar', 'error');
    }
  });

  function abrirModalDeletar(id) {
    idParaDeletar = id;
    openModal(modalConfirm);
  }

  confirmarDeleteBtn.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/${idParaDeletar}`, { method: 'DELETE' });
      closeModal(modalConfirm);
      carregarDados();
      toast('Excluído', 'success');
    } catch {
      toast('Erro ao excluir', 'error');
    }
  });

  cancelarDeleteBtn.addEventListener('click', () => closeModal(modalConfirm));

  async function abrirModalEditar(id) {
    idParaEditar = id;
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    const m = json.data;

    editTitulo.value = m.titulo;
    editAutor.value = m.autor;
    editAno.value = m.ano;
    editGenero.value = m.genero;
    editImagem.value = m.imagem;

    openModal(modalEdit);
  }

  cancelarEditBtn.addEventListener('click', () => closeModal(modalEdit));

  salvarEditBtn.addEventListener('click', async () => {
    const titulo = editTitulo.value.trim();
    const autor = editAutor.value.trim();
    const ano = editAno.value.trim();
    const genero = editGenero.value.trim();
    const imagem = editImagem.value.trim();

    const payload = { titulo, autor, ano: ano ? Number(ano) : null, genero, imagem };

    try {
      await fetch(`${API_BASE}/${idParaEditar}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      closeModal(modalEdit);
      carregarDados();
      toast('Atualizado', 'success');
    } catch {
      toast('Erro ao atualizar', 'error');
    }
  });

  function abrirDetalhes(m) {
    detalhesImg.src = m.imagem || 'https://via.placeholder.com/300x400?text=Sem+Imagem';
    detalhesTitulo.textContent = m.titulo;
    detalhesAutor.textContent = m.autor;
    detalhesAno.textContent = m.ano;
    detalhesGenero.textContent = m.genero;

    detalhesRating.innerHTML = '';
    const r = criarEstrelas(m.id);
    detalhesRating.appendChild(r);

    openModal(modalDetalhes);
  }

  fecharDetalhes.addEventListener('click', () => closeModal(modalDetalhes));

  buscaInput.addEventListener('input', () => { paginaAtual = 1; renderizar(); });
  filtroGenero.addEventListener('change', () => { paginaAtual = 1; renderizar(); });
  ordenacaoSelect.addEventListener('change', () => { paginaAtual = 1; renderizar(); });

  temaToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('tema', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('tema') === 'dark') {
    document.body.classList.add('dark');
  }

  recarregarBtn.addEventListener('click', () => carregarDados());

  carregarDados();
});
