const { user } = require("../db/models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const property = require("../db/models/property");
const { PRICE_PERIODS } = require("../utils/staticData");

const createProperty =  catchAsync(async(req,resp,next) => {
    const body = JSON.parse(req.body.data);

    const userId = req.user.id;

    const images = req.files.map((file) => file.path);

    let annualPrice = body.price.amount;
    if (body.price.timeDuration === PRICE_PERIODS.MONTHLY) {
      annualPrice *= 12; 
    }
  

    const newProperty = await property.create({
        title: body.title,
        description: body.description,
        category: body.category, // RENT or SALE
        country: body.country,
        city: body.city,
        zipCode: body.zipCode,
        streetAddress: body.streetAddress,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        parkingSpots: body.parkingSpots,
        amenities: body.amenities, // JSON object
        latitude: body.latitude,
        longitude: body.longitude,
        propertyImage: images, // Array of image paths
        priceAmountPerAnnum: annualPrice, // Updated price field
        status: body.status, // AVAILABLE, SOLD, etc.
        propertyTypeId: body.propertyTypeId,
        userId: body.userId, // Creator’s user ID
        createdBy: userId, // Set the user who created it
        contactInfo: body.contactInfo, // Contact details as JSON    
    });

    return resp.status(201).json({
        status: 'success',
        data: newProperty,
    });

})


const getAllProperties = catchAsync(async(req,resp,next)=>{
    const userId = req.user.id;
    const result = await property.findAll({
        include: user,
        where: { createdBy: userId },
    });
    return resp.json({
        status: 'success',
        data: result,
    })
})
const getPropertyById = catchAsync(async(req,resp,next)=>{
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId, {include: user});

    if(!result){
        return next(new AppError('Invalid Property Id', 400))
    }   

    return resp.json({
        status: 'success',
        data: result,
    })
})


const updateProperty = catchAsync(async(req,resp,next)=>{
    const userId = req.user.id;
    const propertyId = req.params.id;
    const body = req.body;
    const result = await property.findByPk(propertyId);

    if(!result){
        return next(new AppError('Invalid property id'), 400);
    }
    result.title = body.title;
    result.location = body.location;
    result.latitude = body.latitude;
    result.description = body.description;
    result.propertyImage = body.propertyImage;
    result.propertyTypeId = body.propertyTypeId;

    const updatedResult = await result.save();

    return resp.json({
        status: 'success',
        data: updatedResult,
    });

})


const deleteProperty = catchAsync(async(req,resp,next)=>{
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId);
    if(!result){
        return next(new AppError('Invalid property id'), 400);
    }

     await result.destroy();

    return resp.json({
        status: 'success',
        message: 'Property deleted successfully',
    });

})
module.exports = {createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty};