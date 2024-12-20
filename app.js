require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const docs = require('./docs.js');
const posts = require('./routes/posts.js');
const auth = require('./routes/auth.js');
const users = require('./routes/users.js');
const data = require('./routes/data.js');
const authModel = require('./models/auth.js');

const port = process.env.PORT || 5000;

const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// Setup för Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Klientens URL
        methods: ["GET", "POST"], // HTTP-metoder tillåtna för Socket.IO
    },
});

// Hantera socket-anslutningar
io.on('connection', (socket) => {
    console.log('En användare har anslutit', socket.id);

    // När klienten skapar ett rum (dokument)
    socket.on('create', (room) => {
        console.log(`Ansluter användare till rum med ID: ${room}`);
        socket.join(room);  // Skapar ett rum kopplat till dokumentets ID
    });

    // När servern tar emot en uppdatering från klienten om dokument
    socket.on('doc', (data) => {
        console.log('Mottagen data från klienten:', data);
        // Skicka data till alla andra anslutna klienter i samma rum
        socket.to(data._id).emit('doc', data);
    });

    // När en kommentar tas emot från en klient
    socket.on('comment', (data) => {
        console.log('Received comment:', data);

        // Sänd vidare till alla andra klienter som är anslutna
        socket.broadcast.emit('comment', data);
    });

    // Hantera när en användare kopplas bort
    socket.on('disconnect', () => {
        console.log('Användare kopplade bort');
    });
});

// Grundinställningar för Express
app.disable('x-powered-by');
app.set("view engine", "ejs");

app.use(cors());

app.use(express.static(path.join(process.cwd(), "public")));

// Logger för produktion
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kontrollera API-nyckeln för alla inkommande requests
app.all('*', authModel.checkAPIKey);

app.use("/posts", posts);
app.use("/users", users);
app.use("/data", data);
app.use("/auth", auth);

app.get("/", (req, res) => res.send("Hejsan, hoppsan"));

docs.getAll();

httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});


module.exports = app;
