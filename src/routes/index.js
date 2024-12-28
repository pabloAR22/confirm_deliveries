const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const usersRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/auth', authRoutes);
    router.use('/users', authMiddleware , usersRoutes);
}

module.exports = routerApi;