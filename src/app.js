require('dotenv').config();

const functions = require('@google-cloud/functions-framework');
const express = require('express');
const routerApi = require('./routes');

const app = express();

app.use(express.json());
routerApi(app);

functions.http('confirm-deliveries-api', app);
exports.confirmDeliveriesApi = app;