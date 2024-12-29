const express = require('express');

const guideController = require('../controllers/guideController');

const validateGuidesMiddleware = require('../middlewares/validateGuidesData');
const guideSchema = require('../schemas/guidesSchema');

const router = express.Router();

router.get('/getConfirmedGuides', guideController.getGuides);
router.post('/confirmGuides',validateGuidesMiddleware(guideSchema), guideController.confirmGuides);

module.exports = router;