const userService = require('../services/userServices');

exports.getUsers = async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const userData = {
            username: req.body.username,
            password: req.body.password
        };
        const newUser = await userService.createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};