import 'dotenv/config'

const port = process.env.PORT;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

//import docs from "./docs.mjs";

import posts from "./routes/posts.mjs";

//import './database.mjs';

//import posts from "./routes/posts.mjs";

const app = express();

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(cors())

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/posts", posts);

//docs.getAll();

app.get("/", (req, res) => res.send("Hejsan, hoppsan"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
