import 'dotenv/config';

const port = process.env.PORT;

import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import docs from "./docs.mjs";

import posts from "./routes/posts.mjs";

const app = express();

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(cors());

app.use(express.static(path.join(process.cwd(), "public")));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/posts", posts);

app.get("/", (req, res) => res.send("Hejsan, hoppsan"));

docs.getAll();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
