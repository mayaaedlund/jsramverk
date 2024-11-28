import 'dotenv/config';

const port = process.env.PORT;

import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import formData from 'form-data';
import mg from 'mailgun.js';

import docs from "./docs.mjs";

import posts from "./routes/posts.mjs";
import auth from "./routes/auth.mjs";
import users from "./routes/users.mjs";
import data from "./routes/data.mjs";

import authModel from "./models/auth.mjs";

const app = express();

const mailgun = () =>
  mg({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
  })

app.disable('x-powered-by');
app.set("view engine", "ejs");

app.use(cors());

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
