const express = require('express');
const router = express.Router();

const DetectWebsiteLinksController = require('../controlers/detectWebsiteLinks')

router.post('/detect-website-links', DetectWebsiteLinksController.detectLinks);

module.exports = router;
