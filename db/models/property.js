const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const propertyType = require('./propertyType');

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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Location cannot be null' },
            notEmpty: { msg: 'Location cannot be empty' },
        },
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
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'price cannot be null',
            },
            isDecimal: {
                msg: 'price value must be in decimal',
            },
        },
    },
    status: {
        type: DataTypes.ENUM('AVAILABLE', 'SOLD', 'RENTED', 'EXPIRED'),
        defaultValue: 'AVAILABLE',
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
    propertyTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'propertyType',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',  // If the type is deleted, the relation is set to NULL
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

// Define relationships

propertyType.hasMany(property, { foreignKey: 'propertyTypeId' });
property.belongsTo(propertyType, { foreignKey: 'propertyTypeId' });


module.exports = property;