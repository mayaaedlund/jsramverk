const express = require('express');
const router = express.Router();

const documents = require('../docs.js');

// Lägg till POST-rout
router.post("/", async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        console.log('Inserted document ID:', result.insertedId);
        return res.redirect(`/posts`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Fel vid skapande av dokument');
    }
});

// Lägg till GET-rout för id
router.get('/:id', async (req, res) => {
    try {
        const doc = await documents.getOne(req.params.id);
        return res.render("doc", { doc });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error fetching document');
    }
});

// Lägg till GET-rout för alla dokument
router.get('/', async (req, res) => {
    try {
        const docs = await documents.getAll();
        console.log(docs);
        return res.render("index", { docs });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error fetching documents');
    }
});

// Lägg till POST-rout för uppdatering
router.post('/update', async (req, res) => {
    const { id, title, content } = req.body;

    try {
        await documents.updateOne(id, { title, content });
        return res.redirect('/posts');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error updating document');
    }
});

module.exports = router;
