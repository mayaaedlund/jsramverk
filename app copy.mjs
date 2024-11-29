import 'dotenv/config';

const port = process.env.PORT;

import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
//import formData from 'form-data';
import mg from 'mailgun.js';

import docs from "./docs.mjs";

import posts from "./routes/posts.mjs";
import auth from "./routes/auth.mjs";
import users from "./routes/users.mjs";
import data from "./routes/data.mjs";
import authModel from "./models/auth.mjs";


import { createServer } from 'node:http';
import { Server } from 'socket.io';


const app = express();

const mailgun = () =>
  mg({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
  })

app.disable('x-powered-by');
app.set("view engine", "ejs");

app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

const DEBUG = process.env.DEBUG === 'true';

io.on('connection', (socket) => {
    if (DEBUG) console.log(`User connected: ${socket.id}`);

    socket.on('create', (room) => {
        if (DEBUG) console.log(`Joining room: ${room}`);
        socket.join(room);
    });

    socket.on('content', (data) => {
        if (DEBUG) console.log(`Content updated in room ${data._id}: ${data.content}`);
        socket.to(data._id).emit("content", data.content);
    });

    socket.on('disconnect', () => {
        if (DEBUG) console.log(`User disconnected: ${socket.id}`);
    });
});


app.use(express.static(path.join(process.cwd(), "public")));

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
