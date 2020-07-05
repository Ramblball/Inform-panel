process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { expect } = require('chai');
const should = chai.should();

chai.use(chaiHttp);

describe('Autentication', () => {
    describe('User registration', () => {
        beforeEach(done => {
            User.deleteMany({}, err => {
                done();
            });
        });

        describe('POST /auth', () => {
            it('should registrate user', () => {
                chai.request(app)
                    .post('/auth')
                    .send({
                        login: 'login',
                        name: {
                            first: 'first',
                            last: 'last',
                            patronomic: 'patr'
                        },
                        password: 'pass'
                    })
                    .end((err, res) => {
                        expect(err).to.have.null;
                        res.should.have.status(200);
                        User.findOne({ login: 'login' }, (err, user) => {
                            expect(err).to.have.null;
                            user = user.toObject();
                            user.name.first.should.be.eql('first');
                            user.name.last.should.be.eql('last');
                            user.name.patronomic.should.be.eql('patr');
                            user.image.should.be.a('array');
                            user.image.length.should.be.eql(0);
                            user.video.should.be.a('array');
                            user.video.length.should.be.eql(0);
                            user.hash.should.be.a('string');
                            user.salt.should.be.a('string');
                        });
                    });
            });
        });
    });
});