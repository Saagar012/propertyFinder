const { user } = require("../db/models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const property = require("../db/models/property");
const fs = require('fs');
const path = require('path');
const express = require('express');

const { PRICE_PERIODS, PROPERTY_STATUS } = require("../utils/staticData");
const { Op } = require("sequelize");



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
        latitude: 0,
        longitude: 0,
        propertyImage: images, // Array of image paths
        totalPrice: body.amount, // Updated price field
        status: PROPERTY_STATUS.PENDING_VERIFICATION, // AVAILABLE, SOLD, etc.
        propertyType: body.propertyType,
        userId: body.userId, // Creator’s user ID
        createdBy: userId, // Set the user who created it
        contactInfo: body.contactInfo, // Contact details as JSON    
    });
    const propertyId = newProperty.id;


    // Step 2: Move images to final folder named by propertyId
    const finalDir = `uploads/${propertyId}`;
    fs.mkdirSync(finalDir, { recursive: true });

    const imagePaths = [];
    req.files.forEach((file) => {
        console.log(file);
        const finalPath = path.join(finalDir, file.filename);
        fs.renameSync(file.path, finalPath); // Move file
        imagePaths.push(finalPath);
    });


    return resp.status(201).json({
        status: 'success',
        message: 'Property created with images successfully',
    });
});


const getMyProperties = catchAsync(async (req, resp, next) => {
    const userId = req.user.id;
    const { city, country, propertyType, minPrice, maxPrice, bathrooms, bedrooms, page = 1, limit = 10, ...amenities } = req.query;

    const query = {
        include: user,
        where: { createdBy: userId },
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
    };
    // Add filters conditionally
    if (city) query.where.city = { [Op.iLike]: `%${city}%` }; // Case-insensitive filter
    if (country) query.where.country = { [Op.iLike]: `%${country}%` };
    if (propertyType) query.where.propertyType = { [Op.iLike]: `%${propertyType}%` };
    if (bedrooms) query.where.bedrooms = bedrooms;
    if (bathrooms) query.where.bathrooms = bathrooms;

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
            totalItems: properties.count,
            totalPages: Math.ceil(properties.count / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
        },

    });

});

// Endpoint to calculate approximate mortgage price
const approxMortgagePrice = catchAsync(async (req, res, next) => {
    try {
      const { city, area, bedrooms, bathrooms } = req.body;
  
      // Validate input
      if (!city || !area || !bedrooms || !bathrooms) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Fetch relevant properties from the database
      let properties = await property.findAll({
        where: { city, bedrooms, bathrooms },
        attributes: ['totalPrice', 'totalAreaInMeterSq'], // Fetch only the required fields
      });
  
      if (properties.length === 0) {
        console.log("insid ehte secojd loop");

        // Calculate the bedroom range (one less and one more)
        const minBedrooms = Math.max(bedrooms - 1, 1); // Prevent going below 1 bedroom
        const maxBedrooms = bedrooms + 1;
  
        const minBathrooms = Math.max(bathrooms - 1, 1); // Prevent going below 1 bathroom
        const maxBathrooms = bathrooms + 1;
  
        // Fetch properties with a broader range of bedrooms and bathrooms
        properties = await property.findAll({
          where: {
            city,
            bedrooms: { [Op.between]: [minBedrooms, maxBedrooms] },
            bathrooms: { [Op.between]: [minBathrooms, maxBathrooms] },
          },
          attributes: ['totalPrice', 'totalAreaInMeterSq'], // Fetch only the required fields
        });
  
        if (properties.length === 0) {
            console.log("insid ehte tjird loop");

          // No properties found even in the broader range
          return res.status(404).json({ error: 'No properties found to calculate approximate price.' });
        }
      }

      // Calculate average price per square foot/meter
      const totalArea = properties.reduce((sum, prop) => sum + Number(prop.totalAreaInMeterSq), 0); // Convert to number
      const totalPrice = properties.reduce((sum, prop) => sum + Number(prop.totalPrice), 0); // Convert to number
        
      // Avoid division by zero
      let avgPricePerUnit = 0;
      if (totalArea > 0) {
        avgPricePerUnit = totalPrice / totalArea;
      }
  
      // Calculate approximate price for user's input
      const approxPrice = avgPricePerUnit * area;
  
      res.json({
        avgPricePerUnit: avgPricePerUnit.toFixed(2),
        totalApproxCost: approxPrice.toFixed(2),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    
const getFilteredProperties = catchAsync(async (req, resp, next) => {
    // const userId = req.user.id;
    const { city, country, propertyType, category, minPrice,
         minArea, maxArea,topOffer,latestProperty,
         maxPrice, bathrooms, bedrooms, page = 1, limit = 10, ...amenities } = req.query;

    const query = {
        include: user,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        where: {
            status: PROPERTY_STATUS.VERIFIED
        },
    };
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
    if (topOffer)  query.order = [['totalPrice', 'ASC']]; // Sort by price in ascending order
    
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
            totalItems: properties.count,
            totalPages: Math.ceil(properties.count / limit),
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
    const body = req.body;
    const result = await property.findByPk(propertyId);

    if (!result) {
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
module.exports = { createProperty, getMyProperties,getMyPropertyById, getPropertyById, updateProperty, deleteProperty, getFilteredProperties, approxMortgagePrice};