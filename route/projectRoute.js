const express = require('express');
const { createProject, getAllProjects } = require('../controller/projectcontroller');
const {  authentication, restrictTo } = require('../controller/authcontroller')
const router = express.Router();


router.route('/').post(authentication,restrictTo('1'), createProject).get(authentication,restrictTo('1'), getAllProjects);


module.exports = router;