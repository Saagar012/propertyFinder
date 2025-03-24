const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const propertyType = require('./propertyType');
const { PROPERTY_STATUS } = require('../../utils/staticData');

const property = sequelize.define('property', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'title cannot be null',
            },
            notEmpty: {
                msg: 'title cannot be empty',
            },
        },
    },
    totalAreaInMeterSq: {
      type: DataTypes.FLOAT,  // You can also use DataTypes.DECIMAL if you want more precision
      allowNull: false,

      validate: {
          notNull: {
              msg: 'Total area cannot be null',
          },
          isFloat: {
              msg: 'Total area must be a numeric value',
          },
          min: {
              args: [0],
              msg: 'Total area must be greater than or equal to 0',
          },
      },
  },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: DataTypes.ENUM('RENT', 'SALE'),
        allowNull: false,
        validate: {
          notNull: { msg: 'Category cannot be null' },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      streetAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bedrooms: {
        type: DataTypes.INTEGER,
      },
      bathrooms: {
        type: DataTypes.INTEGER,
      },
      parkingSpots: {
        type: DataTypes.INTEGER,
      },
      amenities: {
        type: DataTypes.JSONB, // Store amenities as a JSON object
        allowNull: true,
      },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),  // Suitable for geographic coordinates
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),  // Suitable for geographic coordinates
    },
    propertyImage: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'productImage cannot be null',
            },
        },
    },
    totalPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          notNull: { msg: 'Price amount cannot be null' },
          isDecimal: { msg: 'Price must be a decimal value' },
        },
      },
    status: {
        type: DataTypes.ENUM(PROPERTY_STATUS.PENDING_VERIFICATION,
          PROPERTY_STATUS.VERIFIED ,
          PROPERTY_STATUS.SOLD_OUT, 
          PROPERTY_STATUS.REJECTED, 
          PROPERTY_STATUS.EXPIRED),
        defaultValue: PROPERTY_STATUS.PENDING_VERIFICATION,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    propertyType: {
        type: DataTypes.ENUM('HOUSE', 'COMMERCIAL', 'APARTMENT'),
        defaultValue: 'HOUSE',
    },
    contactInfo: {
        type: DataTypes.JSONB, // Store contact information as a JSON object
        allowNull: false,
      },
    createdBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'user',
            key: 'id',
        },
    },
},
    {
        timestamps: true,  // Enable createdAt and updatedAt by default
        paranoid: true,
        freezeTableName: true,
        modelName: 'property',
    })

module.exports = property;