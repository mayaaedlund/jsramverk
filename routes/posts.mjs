import express from 'express';
const router = express.Router();

import documents from "../docs.mjs";

router.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect('/');
});

router.get('/:id', async (req, res) => {
    return res.render(
        "doc",
        { doc: await documents.getOne(req.params.id) }
    );
});

router.get('/', async (req, res) => {
    const docs = await documents.getAll();

    console.log(docs);

    return res.json({
        data: docs
    });

    
    //return res.render("index", { docs: await documents.getAll() });
});

router.post('/update', async (req, res) => {
    const { id, title, content } = req.body;

    try {
        const result = await documents.updateOne(id, { title, content });

        if (result.changes > 0) {
            return res.redirect('/');
        } else {
            return res.status(404).send('Document not found');
        }
    } catch (err) {
        return res.status(500).send('Error updating document');
    }
});


export default router;