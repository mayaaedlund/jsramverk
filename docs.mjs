//import openDb from './db/database.mjs';

import database from './database.mjs';
import { ObjectId } from 'mongodb';


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
        //let db = await openDb();
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
            // Använd insertOne för att skapa ett nytt dokument
            const result = await db.collection.insertOne({
                title: body.title,
                content: body.content,
                createdAt: new Date(), // Om du vill ha en timestamp
            });
            return result;
        } catch (e) {
            console.error('Error inserting document:', e); // Logga eventuella fel
            throw e; // Kasta felet vidare så att det kan fångas i router
        } finally {
            await db.client.close();
        }
    },
    

    updateOne: async function updateOne(id, body) {
        let db = await database.getDb();
        try {
            const result = await db.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { title: body.title, content: body.content } }
            );
            return result;
        } finally {
            await db.client.close();
        }
    }
};

export default docs;
