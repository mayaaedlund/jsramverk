import express from 'express';
const router = express.Router();

import documents from "../docs.mjs";

router.post("/", async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        console.log('Inserted document ID:', result.insertedId); // Logga det insatta ID:t
        return res.status(201).json({ id: result.insertedId }); // Returnera ID för det insatta dokumentet
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Fel vid skapande av dokument' });
    }
});


// Hämta ett specifikt dokument
router.get('/:id', async (req, res) => {
    const doc = await documents.getOne(req.params.id);
    if (Object.keys(doc).length === 0) {
        return res.status(404).json({ error: 'Dokument ej hittat' });
    }
    return res.json(doc);
});

// Hämta alla dokument
router.get('/', async (req, res) => {
    const docs = await documents.getAll();
    return res.json(docs);
});


// Uppdatera ett dokument
router.post('/update', async (req, res) => {
    const { id, title, content } = req.body;

    try {
        await documents.updateOne(id, { title, content });
        return res.status(200).json({ message: 'Dokument uppdaterat' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Fel vid uppdatering av dokument' });
    }
});

export default router;