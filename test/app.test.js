import app from '../app';  // Importera din Express-app
import request from 'supertest';

let server;

beforeAll(() => {
  server = app.listen(5001);  // Starta servern på port 5001
});

afterAll((done) => {  // Lägg till done för att säkerställa att servern stängs innan testet avslutas
  server.close(done);  // Använd done för att vänta på att servern ska stängas ordentligt
});

test('Skall svara med status 200 på root route', async () => {
  const response = await request(server).get('/');
  expect(response.status).toBe(200);
});
