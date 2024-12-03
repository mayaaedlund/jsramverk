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
                owner: body.username,
                access: body.email
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

    // Lägger till en kommentar till ett dokument
    addComment: async function addComment(id, line, comment, username) {
        let db = await database.getDb();
        try {
            const result = await db.collection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { comments: { line, comment, username, created_at: new Date() } } } // Lägg till kommentar med användarnamn och skapelsedatum
            );
            return result; // Returnera resultatet av kommentartillägget
        } catch (e) {
            console.error("Error adding comment:", e);
            throw e; // Hantera fel vid tillägg av kommentar
        } finally {
            await db.client.close();
        }
    },
    
    // Hämtar alla kommentarer för ett specifikt dokument
    getComments: async function getComments(id) {
        let db = await database.getDb();
        try {
            const doc = await db.collection.findOne({ _id: new ObjectId(id) });
            return doc ? doc.comments : []; // Returnera kommentarer om de finns, annars en tom array
        } catch (e) {
            console.error("Error fetching comments:", e);
            return []; // Hantera eventuella fel genom att returnera en tom array
        } finally {
            await db.client.close();
        }
    }
};
    

export default docs;