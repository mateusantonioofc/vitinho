const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./biblioteca.db', (err) => {
  if (!err) {
    db.run(
      `CREATE TABLE IF NOT EXISTS Biblioteca (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        ano INTEGER,
        genero TEXT,
        autor TEXT,
        imagem TEXT
      )`
    );
  }
});

app.get('/api/biblioteca', (req, res) => {
  db.all('SELECT * FROM Biblioteca', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'success', data: rows });
  });
});

app.get('/api/biblioteca/:id', (req, res) => {
  db.get('SELECT * FROM Biblioteca WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'success', data: row });
  });
});

app.post('/api/biblioteca', (req, res) => {
  const { titulo, ano, genero, autor, imagem } = req.body;
  if (!titulo) return res.status(400).json({ error: 'O título é obrigatório' });

  db.run(
    `INSERT INTO Biblioteca (titulo, ano, genero, autor, imagem)
     VALUES (?, ?, ?, ?, ?)`,
    [titulo, ano, genero, autor, imagem],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Mangá adicionado com sucesso', id: this.lastID });
    }
  );
});

app.put('/api/biblioteca/:id', (req, res) => {
  const { titulo, ano, genero, autor, imagem } = req.body;

  db.run(
    `UPDATE Biblioteca
     SET titulo = ?, ano = ?, genero = ?, autor = ?, imagem = ?
     WHERE id = ?`,
    [titulo, ano, genero, autor, imagem, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Mangá não encontrado' });
      res.json({ message: 'Mangá atualizado com sucesso', id: req.params.id });
    }
  );
});

app.delete('/api/biblioteca/:id', (req, res) => {
  db.run('DELETE FROM Biblioteca WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Mangá não encontrado' });
    res.json({ message: 'Mangá deletado com sucesso', changes: this.changes });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

process.on('SIGINT', () => {
  db.close(() => process.exit(0));
});
