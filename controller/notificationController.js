
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

module.exports = { getAllNotifications, countUnreadNotifications };
