const express = require('express');
const router = express.Router();
const documents = require('../docs.js');
const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

// Skapa ett nytt dokument
router.post("/", async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        console.log('Inserted document ID:', result.insertedId);
        return res.status(201).json({ id: result.insertedId });
    } catch (error) {
        console.error('Error creating document:', error);
        return res.status(500).json({ error: 'Fel vid skapande av dokument' });
    }
});

// Hämta ett specifikt dokument
router.get('/:id', async (req, res) => {
    try {
        const doc = await documents.getOne(req.params.id);
        if (Object.keys(doc).length === 0) {
            return res.status(404).json({ error: 'Dokument ej hittat' });
        }
        return res.json(doc);
    } catch (error) {
        console.error('Error fetching document:', error);
        return res.status(500).json({ error: 'Fel vid hämtning av dokument' });
    }
});

// Hämta alla dokument
router.get('/', async (req, res) => {
    try {
        const docs = await documents.getAll();
        return res.json(docs);
    } catch (error) {
        console.error('Error fetching all documents:', error);
        return res.status(500).json({ error: 'Fel vid hämtning av dokument' });
    }
});

// Uppdatera ett dokument
router.post('/update', async (req, res) => {
    const { id, title, content, email } = req.body;

    try {
        const result = await documents.updateOne(id, { title, content, email });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Dokument ej hittat eller ingen ändring gjordes' });
        }
        return res.status(200).json({ message: 'Dokument uppdaterat' });
    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({ error: 'Fel vid uppdatering av dokument' });
    }
});

// Skicka e-post
router.post('/email', (req, res) => { 
    const { email, title } = req.body;

    console.log('Skickar e-post till:', email, 'med titel:', title);

    mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'Excited User <mailgun@sandbox85321a4b41e4402297f7e0272f8179a9.mailgun.org>',
        to: [email],
        subject: `Inbjudan att redigera dokumentet ${title}`,
        text: "hejhej",
        html: `<p>Registrera dig och börja redigera <a href="http://localhost:3000/register">här</a></p>`,
    })
    .then(response => {
        console.log('E-post skickad:', response);
        return res.status(200).send({ message: 'E-post skickad framgångsrikt' });
    })
    .catch(error => {
        console.error('Fel vid sändning av e-post:', error);

        if (error.response) {
            console.error('Fel från Mailgun:', error.response.body);
        }

        return res.status(500).send({ message: 'Fel vid sändning av e-post', error: error.message });
    });
});

module.exports = router;
