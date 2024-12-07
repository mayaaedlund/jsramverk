const request = require("supertest");
const app = require("../app");
const authModel = require("../models/auth");

// Mocka authModel.checkAPIKey
jest.mock("../models/auth", () => ({
    checkAPIKey: jest.fn((req, res, next) => next()),
}));

describe("Express server HTTP routes", () => {
    test("GET / should return a greeting message", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Hejsan, hoppsan");
    });

    test("Middleware should check API key", async () => {
        await request(app).get("/");
        expect(authModel.checkAPIKey).toHaveBeenCalled();
    });
});
