
const catchAsync = require("../utils/catchAsync");
const notification = require("../db/models/notification");

const getAllNotifications = catchAsync(async (req, resp, next) => {
    const result = await notification.findAll({
        order: [['createdAt', 'DESC']], 
    });

    return resp.json({
        status: 'success',
        data: result,
    });
});



const countUnreadNotifications = catchAsync(async (req, resp, next) => {
    console.log("this count api is hit");

    const unreadCount = await notification.count({
        where: {
            is_read: false // Assuming `is_read` is a boolean field
        }
    });

    return resp.json({
        status: 'success',
        count: unreadCount,
    });
    
});



const updateUnreadNotificationsCount = catchAsync(async (req, resp, next) => {
    await notification.update(
        { is_read: true },
        { where: { is_read: false } }
    );
    return resp.json({
        status: 'success',
        message: 'All unread notifications marked as read'
    });
});

module.exports = { getAllNotifications, countUnreadNotifications , updateUnreadNotificationsCount};
