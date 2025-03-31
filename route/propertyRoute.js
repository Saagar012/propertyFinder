const express = require('express');
const { authentication, restrictTo } = require('../controller/authcontroller');
const upload = require('../utils/upload'); 

const { createProperty,getFilteredProperties, getPropertyById, updateProperty, deleteProperty, getMyProperties, getMyPropertyById, approxMortgagePrice, approveRejectProperty, updateRejectionMessage } = require('../controller/propertyController');
const { USER_TYPE } = require('../utils/staticData');
const router = express.Router();


router.route('/filtered')
    .get(getFilteredProperties)
router.route('/approx-mortgage-price')
    .post(approxMortgagePrice)

router.route('/')
    .post(authentication, restrictTo(USER_TYPE.NORMAL_USER),upload.array('images', 8), createProperty)
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), getMyProperties)



router.route('/:id').get(getPropertyById)
router.route('/details/:id').get(authentication,restrictTo(USER_TYPE.NORMAL_USER),getMyPropertyById)
router.route('/update/:id').post(authentication, upload.none(), updateProperty)
router.route('/:id').delete(authentication,restrictTo(USER_TYPE.NORMAL_USER),deleteProperty)
router.route('/:id/rejection-message').post(updateRejectionMessage)   
router.route('/:id/approve-reject').post(approveRejectProperty)



module.exports = router;    