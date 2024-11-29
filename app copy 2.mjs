import 'dotenv/config';

const port = process.env.PORT;

import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import docs from "./docs.mjs";
import posts from "./routes/posts.mjs";
import auth from "./routes/auth.mjs";
import users from "./routes/users.mjs";
import data from "./routes/data.mjs";
import authModel from "./models/auth.mjs";


import { createServer } from 'node:http';
import { Server } from 'socket.io';


const app = express();
const httpServer = createServer(app);

//mailgun

app.disable('x-powered-by');
app.set("view engine", "ejs");

app.use(cors());


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
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
