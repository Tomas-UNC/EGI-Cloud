const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = './users.json';

// Utilidad para leer la base de datos
function readDB() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Utilidad para escribir la base de datos
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Registrar usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });

    let db = readDB();
    if (db[username]) return res.status(400).json({ error: 'Usuario ya existe' });

    db[username] = { password, scores: [] };
    writeDB(db);
    res.json({ message: 'Usuario creado' });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let db = readDB();
    if (!db[username] || db[username].password !== password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    res.json({ message: 'Login exitoso' });
});

// Guardar puntaje
app.post('/score', (req, res) => {
    const { username, password, score } = req.body;
    let db = readDB();
    if (!db[username] || db[username].password !== password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    db[username].scores.push(score);
    writeDB(db);
    res.json({ message: 'Puntaje guardado' });
});

// Obtener puntajes
app.get('/scores/:username', (req, res) => {
    const { username } = req.params;
    let db = readDB();
    if (!db[username]) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ scores: db[username].scores });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));