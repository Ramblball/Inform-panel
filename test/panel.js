process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Panel', () => {

    describe('Get panel page GET /panel', () => {
        it('Page successfully getted', () => {
            chai.request(app)
                .get('/panel')
                .end((err, res) => {
                    let page = fs.readFileSync(path.join(__dirname, '..', 'view', 'html', 'panel.html')).toString();
                    res.should.have.status(200);
                    res.should.have.property('text').eql(page);
                });
        });
    });

    describe('Get panel albums', () => {
        it('Albums successfully getted', () => {
            chai.request(app)
                .get('/panel/album')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                });
        });
    });

    describe('Get panel texts', () => {
        it('Texts successfully getted', () => {
            chai.request(app)
                .get('/panel/text')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                });
        });
    });
});