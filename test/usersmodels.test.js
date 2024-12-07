const users = require('../models/users.js');
const database = require('../database.js');
const { ObjectId } = require('mongodb');

// Mocka Express-responsen (res)
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
};

jest.mock('../database', () => ({
    getDb: jest.fn(),
}));

describe('users module', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getAll should return users data when apiKey is valid', async () => {
        const mockDb = {
            collection: {
                findOne: jest.fn().mockResolvedValue({
                    users: [
                        { user_id: '1', email: 'user1@example.com' },
                        { user_id: '2', email: 'user2@example.com' }
                    ]
                })
            },
            client: { close: jest.fn() }
        };

        database.getDb.mockResolvedValue(mockDb);

        const apiKey = 'valid-api-key';
        const res = mockResponse();

        await users.getAll(res, apiKey);

        // Kontrollera att rätt status och data skickades i svaret
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [
                { user_id: '1', email: 'user1@example.com' },
                { user_id: '2', email: 'user2@example.com' }
            ]
        });

        expect(mockDb.collection.findOne).toHaveBeenCalledWith(
            { key: apiKey },
            { users: { email: 1, password: 0 } }
        );
        expect(mockDb.client.close).toHaveBeenCalled();
    });

    test('getAll should return 500 if there is a database error', async () => {
        const mockDb = {
            collection: {
                findOne: jest.fn().mockRejectedValue(new Error('Database error'))
            },
            client: { close: jest.fn() }
        };

        database.getDb.mockResolvedValue(mockDb);

        const apiKey = 'invalid-api-key';
        const res = mockResponse();

        await users.getAll(res, apiKey);

        // Kontrollera att rätt status och felmeddelande skickades
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: 500,
                path: '/users',
                title: 'Database error',
                message: 'Database error'
            }
        });

        expect(mockDb.client.close).toHaveBeenCalled(); // Kontrollera att klienten stängdes
    });
});
