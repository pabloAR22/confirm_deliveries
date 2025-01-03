const bcrypt = require('bcryptjs');
const db = require('../config/firestore');

exports.getAllUsers = async () => {
    try {
      const allUsersData = await db.collection('users').get();
      
      return allUsersData.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data
        };
      });

    } catch (error) {
      throw new Error('Cant get users data: ' + error.message);
    }
};

exports.createUser = async (userData) => {
    try {
      const usernameQuery = await db.collection('users') .where('username', '==', userData.username) .get();
      
      if (!usernameQuery.empty) {
        throw new Error('User already in use');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const docRef = await db.collection('users').add({
        username: userData.username,
        password: hashedPassword
      });

      return { id: docRef.id, ...userData };
    } catch (error) {
      throw new Error('Cant create user: ' + error.message);
    }
};

exports.loginUser = async (username, password) => {
  const userDoc = await db.collection('users').where('username', '==', username).limit(1).get();

  if(userDoc.empty) {
    throw new Error('Error: incorrect username or password');
  }

  const user = userDoc.docs[0].data();

  const verifyPassword = await bcrypt.compare(password, user.password);

  if(!verifyPassword) {
    throw new Error('Error: incorrect username or password');
  }

  return { id: userDoc.docs[0].id, username: user.username };
}