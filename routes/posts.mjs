import express from 'express';
const router = express.Router();
import documents from "../docs.mjs";
import formData from 'form-data';



import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});


// Skapa ett nytt dokument
router.post("/", async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        console.log('Inserted document ID:', result.insertedId); // Logga det insatta ID:t
        return res.status(201).json({ id: result.insertedId }); // Returnera ID för det insatta dokumentet
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
    const docs = await documents.getAll();
    return res.json(docs);
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

// Lägg till en kommentar till ett dokument
router.post('/comment', async (req, res) => {
    const { documentId, line, comment, username } = req.body;

    if (!documentId || !line || !comment || !username) {
        return res.status(400).json({ error: 'Alla fält måste vara ifyllda' });
    }

    try {
        const result = await documents.addComment(documentId, line, comment, username);
        return res.status(200).json(result); // Returnera resultatet av kommentartillägget
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'Fel vid tillägg av kommentar' });
    }
});



// Hämta kommentarer för ett dokument
router.get('/comments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const comments = await documents.getComments(id);
        if (comments.length === 0) {
            return res.status(404).json({ error: 'Inga kommentarer hittades för detta dokument' });
        }
        return res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: 'Fel vid hämtning av kommentarer' });
    }
});





export default router;
