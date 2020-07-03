process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const sould = chai.should();

chai.use(chaiHttp);