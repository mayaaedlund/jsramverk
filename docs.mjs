//import openDb from './db/database.mjs';

import database from './database.mjs';

const docs = {
    getAll: async function getAll() {
        let db = await database.getDb();

        try {
            return await db.collection.find().toArray();
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.client.close();
        }
    },

    getOne: async function getOne(id) {
        let db = await openDb();

        try {
            return await db.get('SELECT * FROM documents WHERE rowid=?', id);
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.close();
        }
    },

    addOne: async function addOne(body) {
        let db = await openDb();

        try {
            return await db.run(
                'INSERT INTO documents (title, content) VALUES (?, ?)',
                body.title,
                body.content,
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },

    updateOne: async function updateOne(id, body) {
        let db = await openDb();

        try {
            const result = await db.run(
                'UPDATE documents SET title = ?, content = ? WHERE rowid = ?',
                body.title,
                body.content,
                id
            );
            return result;
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    }
};

export default docs;
