const catchAsync = require("../utils/catchAsync");
const Notification = require("../db/models/notification");

const createNotificationService = catchAsync(async ({ userId, message }) => {
    try {
        await Notification.create({
            userId,
            message,
            is_read: false,
            created_at: new Date(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
});

module.exports = createNotificationService;
