const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
// const serviceAccount = require('../../key.json');

initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

module.exports = db;
