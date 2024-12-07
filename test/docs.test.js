const docs = require('../docs.js');
const database = require('../database.js');
const { ObjectId } = require('mongodb');

// Mocka MongoDB-databasen
jest.mock('../database.js', () => ({
    getDb: jest.fn(),
}));

describe('docs module', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Rensa mockar efter varje test
    });

    test('getAll should return an array of documents', async () => {
        const mockDb = {
            collection: {
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([{ title: 'Doc 1' }, { title: 'Doc 2' }]),
                }),
            },
            client: { close: jest.fn() },
        };

        // Mocka getDb för att returnera en mockad db
        database.getDb.mockResolvedValue(mockDb);

        const result = await docs.getAll();

        expect(result).toEqual([{ title: 'Doc 1' }, { title: 'Doc 2' }]);
        expect(mockDb.collection.find).toHaveBeenCalled();
        expect(mockDb.client.close).toHaveBeenCalled();
    });

    test('getOne should return a single document', async () => {
        const mockDb = {
            collection: {
                findOne: jest.fn().mockResolvedValue({ title: 'Doc 1' }),
            },
            client: { close: jest.fn() },
        };

        // Mocka getDb för att returnera en mockad db
        database.getDb.mockResolvedValue(mockDb);

        const result = await docs.getOne('507f191e810c19729de860ea'); // Exempel ID

        expect(result).toEqual({ title: 'Doc 1' });
        expect(mockDb.collection.findOne).toHaveBeenCalledWith({
            _id: new ObjectId('507f191e810c19729de860ea'),
        });
        expect(mockDb.client.close).toHaveBeenCalled();
    });

    test('addOne should insert a document', async () => {
        const mockDb = {
            collection: {
                insertOne: jest.fn().mockResolvedValue({ insertedId: '507f191e810c19729de860ea' }),
            },
            client: { close: jest.fn() },
        };

        // Mocka getDb för att returnera en mockad db
        database.getDb.mockResolvedValue(mockDb);

        const body = { title: 'New Document', content: 'Some content', username: 'user', email: 'user@example.com' };
        const result = await docs.addOne(body);

        expect(result.insertedId).toBe('507f191e810c19729de860ea');
        expect(mockDb.collection.insertOne).toHaveBeenCalledWith({
            title: body.title,
            content: body.content,
            owner: body.username,
            access: body.email,
        });
        expect(mockDb.client.close).toHaveBeenCalled();
    });

    test('updateOne should update an existing document', async () => {
        const mockDb = {
            collection: {
                updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            },
            client: { close: jest.fn() },
        };

        // Mocka getDb för att returnera en mockad db
        database.getDb.mockResolvedValue(mockDb);

        const body = { title: 'Updated Title', content: 'Updated Content', email: 'newemail@example.com' };
        const result = await docs.updateOne('507f191e810c19729de860ea', body);

        expect(result.modifiedCount).toBe(1);
        expect(mockDb.collection.updateOne).toHaveBeenCalledWith(
            { _id: new ObjectId('507f191e810c19729de860ea') },
            { $set: { title: body.title, content: body.content, access: body.email } }
        );
        expect(mockDb.client.close).toHaveBeenCalled();
    });
});
