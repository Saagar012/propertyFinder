const express = require('express');
const { authentication, restrictTo } = require('../controller/authcontroller')
const router = express.Router();
const { USER_TYPE } = require('../utils/staticData');

const { getAllNotifications, countUnreadNotifications } = require('../controller/notificationController');

router.route('/')
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), getAllNotifications);


router.route('/unread-count')
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), countUnreadNotifications);


module.exports = router;    