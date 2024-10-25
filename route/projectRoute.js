const express = require('express');
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject } = require('../controller/projectcontroller');
const { authentication, restrictTo } = require('../controller/authcontroller')
const router = express.Router();


router.route('/')
    .post(authentication, restrictTo('1'), createProject)
    .get(authentication, restrictTo('1'), getAllProjects);

router.route('/:id').get(authentication,restrictTo('1'),getProjectById)
router.route('/:id').put(authentication,restrictTo('1'),updateProject)
router.route('/:id').delete(authentication,restrictTo('1'),deleteProject)




module.exports = router;    