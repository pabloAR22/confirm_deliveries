const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const validateDataUsers = require('../middlewares/validateDataUsers');
const userSchema = require('../schemas/userSchema');

const authRoutes = require('./authRoutes');
const usersRoutes = require('./userRoutes');
const guideRoutes = require('./guideRoutes');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/auth', validateDataUsers(userSchema),authRoutes);
    router.use('/users', authMiddleware, usersRoutes);
    router.use('/guides', authMiddleware, guideRoutes);
}

module.exports = routerApi;