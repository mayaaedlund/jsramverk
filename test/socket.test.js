const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const app = require("../app");

describe("Socket.IO functionality", () => {
    let ioServer, httpServer, clientSocket;

    beforeAll((done) => {
        // Starta HTTP- och Socket.IO-servrar
        httpServer = createServer(app);
        ioServer = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
            },
        });

        // Lyssna på anslutningar
        ioServer.on("connection", (socket) => {
            socket.on("create", (room) => {
                socket.join(room);
                socket.emit("joined-room", { room });
            });

            socket.on("doc", (data) => {
                socket.to(data._id).emit("doc", data);
            });
        });

        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = Client(`http://localhost:${port}`);
            clientSocket.on("connect", done);
        });
    });

    afterAll((done) => {
        clientSocket.close();
        ioServer.close();
        httpServer.close(done);
    });

    test("Client should connect", () => {
        expect(clientSocket.connected).toBe(true);
    });

    test("Client can join a room", (done) => {
        const roomId = "test-room";
        clientSocket.emit("create", roomId);

        clientSocket.on("joined-room", (data) => {
            expect(data.room).toBe(roomId);
            done();
        });
    });
});
