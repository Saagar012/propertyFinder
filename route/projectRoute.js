const express = require('express');
const { createProject } = require('../controller/projectcontroller');
const router = express.Router();

router.route('/').post(createProject);

module.exports = router;