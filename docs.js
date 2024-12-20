const database = require('./database.js');
const { ObjectId } = require('mongodb');

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
        let db = await database.getDb();

        try {
            return await db.collection.findOne({ _id: new ObjectId(id) });
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(body) {
        let db = await database.getDb();

        try {
            const result = await db.collection.insertOne({
                title: body.title,
                content: body.content,
                owner: body.username,
                access: body.email,
            });
            return result;
        } catch (e) {
            console.error('Error inserting document:', e);
            throw e;
        } finally {
            await db.client.close();
        }
    },

    updateOne: async function updateOne(id, body) {
        let db = await database.getDb();
        try {
            const result = await db.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { title: body.title, content: body.content, access: body.email } }
            );
            return result;
        } finally {
            await db.client.close();
        }
    },
};

module.exports = docs;
