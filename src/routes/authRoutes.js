const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;