const { user } = require("../db/models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const property = require("../db/models/property");

const createProperty = catchAsync(async(req,resp,next) => {
    const body = req.body;
    const userId = req.user.id;

    const newProperty = await property.create({
        id: body.id,
        title: body.title,
        location:body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        propertyImage: body.propertyImage,
        price: body.price,
        status: body.status,
        description: body.description,
        propertyTypeId: body.propertyTypeId,
        userId:body.userId,
        createdBy: userId,
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