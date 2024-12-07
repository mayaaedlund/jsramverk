require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Skapa en server med Express-appen
const server = http.createServer(app);

// Starta servern
server.listen(PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);
});
