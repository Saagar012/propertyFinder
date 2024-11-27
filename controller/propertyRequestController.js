const { sendEmail } = require("../services/emailservice");
const catchAsync = require("../utils/catchAsync");

const propertyRequest = catchAsync(async (req, resp, next) => {

    const { date, email, message, name, phoneNumber,ownerEmail } = req.body;
    sendEmail(name, email, phoneNumber, message, date,ownerEmail).then(info => {
        // Send the response in the required format
        return resp.status(200).json({
            status: 'success',
            data: { info: 'Email sent successfully!' },
        });
    })
        .catch(err => {
            return resp.status(500).json({
                status: 'error',
                data: { info: 'Failed to send the email!' },
            });
        });
});

module.exports = { propertyRequest };  