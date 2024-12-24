const bcrypt = require('bcryptjs');
const db = require('../config/firestore');

exports.getAllUsers = async () => {
    try {
      const allUsersData = await db.collection('users').get();
      return allUsersData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error al obtener los usuarios: ' + error.message);
    }
};

exports.createUser = async (userData) => {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const docRef = await db.collection('users').add({
        username: userData.username,
        password: hashedPassword
      });

      return { id: docRef.id, ...userData };
    } catch (error) {
      throw new Error('Error al crear el usuario: ' + error.message);
    }
};