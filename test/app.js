/* global it describe */

process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.mjs';

chai.should();
chai.use(chaiHttp);

describe('GET /', function() {
    it('should return "Hejsan, hoppsan"', function(done) {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.equal('Hejsan, hoppsan');
                done();
            });
    });
});
