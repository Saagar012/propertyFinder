const express = require('express');
const { authentication, restrictTo } = require('../controller/authcontroller');
const { createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty } = require('../controller/propertyController');
const router = express.Router();


router.route('/')
    .post(authentication, restrictTo('1'), createProperty)
    .get(authentication, restrictTo('1'), getAllProperties);

router.route('/:id').get(authentication,restrictTo('1'),getPropertyById)
router.route('/:id').put(authentication,restrictTo('1'),updateProperty)
router.route('/:id').delete(authentication,restrictTo('1'),deleteProperty)




module.exports = router;    