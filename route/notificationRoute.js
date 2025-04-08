const express = require('express');
const { authentication, restrictTo } = require('../controller/authcontroller')
const router = express.Router();
const { USER_TYPE } = require('../utils/staticData');
const { getAllNotifications, countUnreadNotifications, updateUnreadNotificationsCount } = require('../controller/notificationcontroller');


router.route('/')
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), getAllNotifications);

    router.route('/update-unread-count')
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER),updateUnreadNotificationsCount);

router.route('/unread-count')
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), countUnreadNotifications);


    
module.exports = router;    