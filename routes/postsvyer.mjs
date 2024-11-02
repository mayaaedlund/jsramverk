import express from 'express';
const router = express.Router();

import documents from "../docs.mjs";

router.post("/", async (req, res) => {
    try {
        const result = await documents.addOne(req.body);
        console.log('Inserted document ID:', result.insertedId); // Logga det insatta ID:t
        return res.redirect(`/posts`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Fel vid skapande av dokument');
    }
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

    //return res.json({
    //    data: docs
    //});

    return res.render("index", { docs: await documents.getAll() });
});


router.post('/update', async (req, res) => {
    const { id, title, content } = req.body;

    try {
        // Försök att uppdatera dokumentet
        await documents.updateOne(id, { title, content });

        // Oavsett om ändringar gjordes eller inte, redirecta till /posts
        return res.redirect('/posts'); 
    } catch (err) {
        console.error(err); // Logga felet för debugging
        return res.status(500).send('Error updating document');
    }
});



export default router;