const userService = require('../services/userServices');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req,res) => {
    try {
        const { username, password } = req.body;

        const newUser = await userService.createUser({ username, password });

        res.status(201).json({
            message: "User created!",
            user: newUser.username
        });

    } catch (error) {
        if (error.message === 'Cant create user: User already in use') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userService.loginUser(username, password);
        const token = jwt.sign({id: user.id, username:user.username}, process.env.JWT_SECRET_KEY, {expiresIn: '60m'});

        res.status(200).json({
            message: 'Login succesfull',
            token,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}