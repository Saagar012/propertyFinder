const express = require('express');
const {restrictTo, authentication } = require('../controller/authcontroller');
const { propertyRequest } = require('../controller/propertyRequestController');
const { USER_TYPE } = require('../utils/staticData');

const router = express.Router();

router.route('/')
    .post( authentication, restrictTo(USER_TYPE.NORMAL_USER), propertyRequest); // POST request to send email


module.exports = router;    