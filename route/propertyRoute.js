const express = require('express');
const { authentication, restrictTo } = require('../controller/authcontroller');
const upload = require('../utils/upload'); 

const { createProperty,getFilteredProperties, getPropertyById, updateProperty, deleteProperty, getMyProperties, getMyPropertyById, approxMortgagePrice } = require('../controller/propertyController');
const { USER_TYPE } = require('../utils/staticData');
const router = express.Router();


router.route('/filtered')
    .get(getFilteredProperties)
router.route('/approx-mortgage-price')
    .post(approxMortgagePrice)

router.route('/')
    .post(authentication, restrictTo(USER_TYPE.NORMAL_USER),upload.array('images', 5), createProperty)
    .get(authentication, restrictTo(USER_TYPE.NORMAL_USER), getMyProperties)



router.route('/:id').get(getPropertyById)
router.route('/details/:id').get(authentication,restrictTo(USER_TYPE.NORMAL_USER),getMyPropertyById)
router.route('/:id').put(authentication,restrictTo(USER_TYPE.NORMAL_USER),updateProperty)
router.route('/:id').delete(authentication,restrictTo(USER_TYPE.NORMAL_USER),deleteProperty)



module.exports = router;    