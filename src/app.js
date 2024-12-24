require('dotenv').config();

const express = require('express');
const routerApi = require('./routes');

const app = express();

app.use(express.json());
routerApi(app);

module.exports = app;
