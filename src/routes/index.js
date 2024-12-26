const express = require('express');

const usersRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/users', usersRoutes);
    router.use('/auth', authRoutes);
}

module.exports = routerApi;