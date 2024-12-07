const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const auth = require('../models/auth.js');

// Mocka auth-modulen
jest.mock('../models/auth.js', () => ({
    getNewAPIKey: jest.fn(),
    deregister: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
}));

// Skapa en Express-app för testning
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', authRoutes);

describe('Auth Routes', () => {

    test('POST /api_key/confirmation with GDPR consent should call getNewAPIKey', async () => {
        auth.getNewAPIKey.mockImplementation((res, email) => {
            res.send("API key created!");
        });

        const response = await request(app).post('/api_key/confirmation').send({
            gdpr: "gdpr",
            email: "test@example.com",
        });

        expect(auth.getNewAPIKey).toHaveBeenCalledWith(expect.anything(), "test@example.com");
        expect(response.text).toContain("API key created!");
    });

    test('POST /api_key/deregister with valid data should call deregister', async () => {
        auth.deregister.mockImplementation((res, body) => {
            res.send("Deregistered successfully!");
        });

        const response = await request(app).post('/api_key/deregister').send({
            email: "test@example.com",
            apikey: "123456",
        });

        expect(auth.deregister).toHaveBeenCalledWith(expect.anything(), {
            email: "test@example.com",
            apikey: "123456",
        });
        expect(response.text).toContain("Deregistered successfully!");
    });

    test('POST /login should call auth.login', async () => {
        auth.login.mockImplementation((res, body) => {
            res.send("Logged in successfully!");
        });

        const response = await request(app).post('/login').send({
            email: "test@example.com",
            password: "password123",
        });

        expect(auth.login).toHaveBeenCalledWith(expect.anything(), {
            email: "test@example.com",
            password: "password123",
        });
        expect(response.text).toContain("Logged in successfully!");
    });

    test('GET / should redirect to /documentation.html', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/documentation.html');
    });
});
