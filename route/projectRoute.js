const express = require('express');
const { createProject } = require('../controller/projectcontroller');
const { authentication } = require('../controller/authcontroller')
const router = express.Router();


router.route('/').post(authentication, createProject);

module.exports = router;