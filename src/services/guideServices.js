const db = require('../config/firestore');

exports.getConfirmedGuides = async() => {
  try {
    const allGuidesData = await db.collection('guides').get();
    return allGuidesData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Error: cant get guides data: ' + error.message);
  }
}

exports.savedGuides = async (guideData) => {
    try {
      const guideId = await db.collection('guides').where('guia', '==', guideData.guia).get();
      
      if(!guideId.empty) {
        throw new Error('Guide already confirmed');
      }

      const guideRef = await db.collection('guides').add(guideData);
      return { id: guideRef.id, data: guideData };
    } catch (error) {
      throw new Error('Cant create guide: ' + error.message);
    }
};