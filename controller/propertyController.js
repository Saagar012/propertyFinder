const { user } = require("../db/models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const property = require("../db/models/property");
const fs = require('fs');
const path = require('path');
const express = require('express');
const createNotificationService = require('../services/notification');

const { PROPERTY_STATUS } = require("../utils/staticData");
const { Op } = require("sequelize");
const { error, Console } = require("console");



const createProperty = catchAsync(async (req, resp, next) => {
    const body = JSON.parse(req.body.data);

    const userId = req.user.id;

    const images = req.files.map((file) => file.filename);
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
        totalAreaInMeterSq: body.totalArea,
        amenities: body.amenities, // JSON object
        latitude: body.latitude,
        longitude: body.longitude,
        propertyImage: images, // Array of image paths
        totalPrice: body.amount, // Updated price field
        status: PROPERTY_STATUS.PENDING_VERIFICATION, // AVAILABLE, SOLD, etc.
        propertyType: body.propertyType,
        userId: userId, // Creator’s user ID
        createdBy: userId, // Set the user who created it
        contactInfo: body.contactInfo, // Contact details as JSON    
    });
    const propertyId = newProperty.id;


    // Step 2: Move images to final folder named by propertyId
    const finalDir = `uploads/${propertyId}`;
    fs.mkdirSync(finalDir, { recursive: true });

    const moveFiles = async () => {
        await Promise.all(
            req.files.map(async (file) => {
                const finalPath = path.join(finalDir, file.filename);
                await fs.promises.rename(file.path, finalPath); // Move file
            })
        );
    };

    try {
        await moveFiles();
        // Call the Notification Service
        const message = `New property "${newProperty.title}" has been submitted for approval.`;
        await createNotificationService({ userId, message });

        return resp.status(201).json({
            status: 'success',
            message: 'Property created with images successfully',
        });
    } catch (error) {
        console.error("Error moving files:", error);
        return resp.status(500).json({
            status: 'error',
            message: 'Failed to move files',
        });
    }

});

const getMyProperties = catchAsync(async (req, resp, next) => {
    const userId = req.user.id;
    const { city, country, propertyType, minPrice, maxPrice, bathrooms, bedrooms, status, page = 1, limit = 6, ...amenities } = req.query;
    // Query to get total count of all matching properties (without limit)
    if(userId.toString() === "10"){
        const query = {
            where: {
                createdAt: {
                  [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
                }
              },              
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
        };
 

    // Fetch properties based on constructed query
    const properties = await property.findAll(query);

    return resp.json({
        status: 'success',
        pagination: {
            data: properties,
            totalItems: properties.length,
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
        },

    });
    
    }
       
    else {
    const totalPropertiesCount = await property.count({
        where: {
            createdBy: userId,
            ...(status && status !== PROPERTY_STATUS.ALL && { status }), // Apply status filter if not ALL
            ...(status === PROPERTY_STATUS.ALL && { status: { [Op.ne]: PROPERTY_STATUS.REJECTED } }) // Exclude rejected properties when status is ALL


        },
    });

    const query = {
        include: user,
        where: { 
            createdBy: userId,
            createdAt: {
                [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
            },
            ...(status && status !== PROPERTY_STATUS.ALL && { status }), // Apply status filter if not ALL
            ...(status === PROPERTY_STATUS.ALL && { status: { [Op.ne]: PROPERTY_STATUS.REJECTED } }) // Exclude rejected properties when status is ALL
        },
        
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
    };
    // Add filters conditionally
    if (city) query.where.city = { [Op.iLike]: `%${city}%` }; // Case-insensitive filter
    if (country) query.where.country = { [Op.iLike]: `%${country}%` };
    if (propertyType) query.where.propertyType = { [Op.iLike]: `%${propertyType}%` };
    if (bedrooms) query.where.bedrooms = bedrooms;
    if (bathrooms) query.where.bathrooms = bathrooms;
    // if (status && status !== PROPERTY_STATUS.ALL) query.where.status = status;  // Filter by status

    if (minPrice || maxPrice) {
        query.where.price = {};
        if (minPrice) query.where.price[Op.gte] = minPrice; // Minimum price
        if (maxPrice) query.where.price[Op.lte] = maxPrice; // Maximum price
    }

    // Filter based on amenities being true
    if (Object.keys(amenities).length > 0) {
        const amenityFilter = {};
        // Loop through amenities and only include those that are 'true'
        Object.keys(amenities).forEach(amenity => {
            if (amenities[amenity] === 'true') {
                amenityFilter[amenity] = true;
            }
        });

        // Only add the filter if there are true amenities
        if (Object.keys(amenityFilter).length > 0) {
            query.where.amenities = {
                [Op.contains]: amenityFilter // Filter JSONB column to match true amenities
            };
        }
    }
    query.order = [['createdAt', 'DESC']];

    // Fetch properties based on constructed query
    const properties = await property.findAll(query);
    // Construct the image URLs for each property
    const propertiesWithImages = properties.map(property => {
        const images = [];

        // Loop through the stored image names for this property
        if (property.propertyImage && property.propertyImage.length > 0) {
            property.propertyImage.forEach(imageName => {
                // Construct the image URL based on property ID and image name
                const imageUrl = `${process.env.LOCAL_API}/uploads/${property.id}/${imageName}`;
                images.push(imageUrl);
            });
        }

        return {
            ...property.toJSON(),
            images, // Add images URLs to the property object
        };
    });

    return resp.json({
        status: 'success',
        data: propertiesWithImages,
        pagination: {
            totalItems: properties.length,
            totalPages: Math.ceil(totalPropertiesCount / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
        },

    });
    }
});


const approxMortgagePrice = catchAsync(async (req, res, next) => {
    try {  
        const { propertyPrice, downPayment, interestRate, loanTerm, paymentFrequency } = req.body;

        const loanAmount = propertyPrice - downPayment;
        const annualInterestRate = interestRate / 100;

        let monthlyPayment, annualPayment;

        // Number of total monthly payments
        const totalMonths = loanTerm * 12;
        const monthlyInterestRate = annualInterestRate / 12;

        if (monthlyInterestRate === 0) {
            // If interest rate is 0%
            monthlyPayment = loanAmount / totalMonths;
        } else {
            monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
        }

        if (paymentFrequency === "MONTHLY") {
            annualPayment = monthlyPayment * 12;
        } else if (paymentFrequency === "WEEKLY") {
            // Convert monthly to weekly approximation (monthly * 12 / 52)
            annualPayment = monthlyPayment * 12;
            monthlyPayment = annualPayment / 52; // Weekly payment
        } else {
            return res.status(400).json({ error: 'Invalid payment frequency' });
        }

        res.status(200).json({
            loanAmount: loanAmount.toFixed(2),
            monthlyPayment: monthlyPayment.toFixed(2),
            annualPayment: annualPayment.toFixed(2),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const getFilteredProperties = catchAsync(async (req, resp, next) => {
    // const userId = req.user.id;
    const { city, country, propertyType, category, minPrice,
        minArea, maxArea, topOffer, latestProperty,
        maxPrice, bathrooms, bedrooms, page = 1, limit = 9, ...amenities } = req.query;

    // Query to get total count of all matching properties (without limit)
    const totalPropertiesCount = await property.count({
        where: {
            status: PROPERTY_STATUS.VERIFIED
        },
    });


    const query = {
        include: user,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        where: {
            status: PROPERTY_STATUS.VERIFIED
        },
    };
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.where.createdAt = { [Op.gte]: thirtyDaysAgo };

    // Add filters conditionally
    if (city) query.where.city = { [Op.iLike]: `%${city}%` }; // Case-insensitive filter
    if (country) query.where.country = { [Op.iLike]: `%${country}%` };
    if (propertyType && Array.isArray(propertyType)) {
        query.where[Op.and] = propertyType.map(pt => ({
            propertyType: pt
        }));
    } else if (propertyType) {
        query.where.propertyType = propertyType; // Direct comparison for single category
    }

    if (category && Array.isArray(category)) {
        query.where[Op.and] = category.map(cat => ({
            category: cat
        }));
    } else if (category) {
        query.where.category = category; // Direct comparison for single category
    }

    if (bedrooms) query.where.bedrooms = bedrooms;
    if (bathrooms) query.where.bathrooms = bathrooms;
    if (minPrice || maxPrice) {
        query.where.totalPrice = {};
        if (minPrice) query.where.totalPrice[Op.gte] = minPrice; // Minimum price
        if (maxPrice) query.where.totalPrice[Op.lte] = maxPrice; // Maximum price
    }
    if (minArea || maxArea) {
        query.where.totalAreaInMeterSq = {};
        if (minArea) query.where.totalAreaInMeterSq[Op.gte] = minArea; // Minimum price
        if (maxArea) query.where.totalAreaInMeterSq[Op.lte] = maxArea; // Maximum price
    }

    query.order = [['createdAt', 'DESC']];

    // Filter based on amenities being true
    if (Object.keys(amenities).length > 0) {
        const amenityFilter = {};
        // Loop through amenities and only include those that are 'true'
        Object.keys(amenities).forEach(amenity => {
            if (amenities[amenity] === 'true') {
                amenityFilter[amenity] = true;
            }
        });
        // Only add the filter if there are true amenities
        if (Object.keys(amenityFilter).length > 0) {
            query.where.amenities = {
                [Op.contains]: amenityFilter // Filter JSONB column to match true amenities
            };
        }
    }
    if (topOffer) query.order = [['totalPrice', 'ASC']]; // Sort by price in ascending order

    if (latestProperty) query.order = [['createdAt', 'DESC']]; // Sort by latest property



    // Fetch properties based on constructed query
    const properties = await property.findAll(query);

    // Construct the image URLs for each property
    const propertiesWithImages = properties.map(property => {
        const images = [];

        // Loop through the stored image names for this property
        if (property.propertyImage && property.propertyImage.length > 0) {
            property.propertyImage.forEach(imageName => {
                // Construct the image URL based on property ID and image name
                const imageUrl = `${process.env.LOCAL_API}/uploads/${property.id}/${imageName}`;
                images.push(imageUrl);
            });
        }

        return {
            ...property.toJSON(),
            images, // Add images URLs to the property object
        };
    });
    return resp.json({
        status: 'success',
        data: propertiesWithImages,
        pagination: {
            totalItems: properties.length,
            totalPages: Math.ceil(totalPropertiesCount / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
        },

    });

});

const getPropertyById = catchAsync(async (req, resp, next) => {
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId, { include: user });

    if (!result) {
        return next(new AppError('Invalid Property Id', 400))
    }

    // Initialize an array to store image URLs
    const images = [];

    // Construct the image URLs for this specific property
    if (result.propertyImage && result.propertyImage.length > 0) {
        result.propertyImage.forEach(imageName => {
            // Construct the image URL based on the property ID and image name
            const imageUrl = `${process.env.LOCAL_API}/uploads/${result.id}/${imageName}`;
            images.push(imageUrl);
        });
    }

    // Return the property details along with the image URLs
    return resp.json({
        status: 'success',
        data: {
            ...result.dataValues,  // Property data
            images,  // Add the constructed image URLs
        },
    });
});


const getMyPropertyById = catchAsync(async (req, resp, next) => {
    const userId = req.user.id;
    const propertyId = req.params.id;

    const query = {
        where: {
            createdBy: userId
        },
        include: [user]
    };
    const result = await property.findByPk(propertyId, { query });


    if (!result) {
        return next(new AppError('Invalid Property Id', 400))
    }

    // Construct the image URLs for each property
    // Initialize an array to store image URLs
    const images = [];

    // Construct the image URLs for this specific property
    if (result.propertyImage && result.propertyImage.length > 0) {
        result.propertyImage.forEach(imageName => {
            // Construct the image URL based on the property ID and image name
            const imageUrl = `${process.env.LOCAL_API}/uploads/${result.id}/${imageName}`;
            images.push(imageUrl);
        });
    }

    // Return the property details along with the image URLs
    return resp.json({
        status: 'success',
        data: {
            ...result.dataValues,  // Property data
            images,  // Add the constructed image URLs
        },
    });
});

const updateProperty = catchAsync(async (req, resp, next) => {
    const userId = req.user.id;
    const propertyId = req.params.id;
    if (!req.params.id) {
        return next(new AppError('Property ID is missing', 400));
    }
    const body = JSON.parse(req.body.data); // Parse JSON string
    const result = await property.findByPk(propertyId);
    

    if (!result) {
        return next(new AppError('Invalid property id'), 400);
    }
    result.title = body.title;
    result.location = body.location;
    result.latitude = body.latitude;
    result.totalPrice = body.amount;
    result.description = body.description;
    result.status = PROPERTY_STATUS.PENDING_VERIFICATION;
    result.streetAddress = body.streetAddress;
    result.bedrooms = body.bedrooms;
    result.bathrooms = body.bathrooms;
    result.parkingSpots = body.parkingSpots

    // result.propertyTypeId = body.propertyTypeId;

    const updatedResult = await result.save();

    try {
        // Call the Notification Service
        const message = `Existing property "${body.title}" has been submitted again for approval.`;
        await createNotificationService({ userId, message });

        return resp.status(201).json({
            status: 'success',
            data: updatedResult,
            message: 'Property updated successfully',
        });
    } catch (error) {
        console.error("Error updating the property:", error);
        return resp.status(500).json({
            status: 'error',
            message: 'Failed to update the property',
        });
    }

})


const deleteProperty = catchAsync(async (req, resp, next) => {
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId);
    if (!result) {
        return next(new AppError('Invalid property id'), 400);
    }

    await result.destroy();

    return resp.json({
        status: 'success',
        message: 'Property deleted successfully',
    });

})

const approveRejectProperty = catchAsync(async (req, resp, next) => {
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId);

    if (!result) {
        return next(new AppError('Invalid property id'), 400);
    }

    const body = req.body;
    if(!result){
        return next(new AppError('Invalid project id'), 400);
    }
    result.status = body.status;

    await result.save();
    return resp.json({
        status: 'success',
        message: 'Property status updated successfully',
    });


})
const updateRejectionMessage = catchAsync(async (req, resp, next) => {
    const propertyId = req.params.id;
    const result = await property.findByPk(propertyId);

    if (!result) {
        return next(new AppError('Invalid property id'), 400);
    }

    const body = req.body;
    if(!result){
        return next(new AppError('Invalid project id'), 400);
    }
    result.rejectionMessage = body.rejectionMessage;
    result.status = "REJECTED";
    await result.save();
    return resp.json({
        status: 'success',
        message: 'Property Rejection Message updated successfully',
    });


})
module.exports = { createProperty, getMyProperties, getMyPropertyById, getPropertyById, updateProperty, deleteProperty, approveRejectProperty,updateRejectionMessage, getFilteredProperties, approxMortgagePrice };