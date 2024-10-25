const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const propertyType = sequelize.define('propertyType', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    type: {
        type: DataTypes.STRING,  // Accepts any string value
        allowNull: false,  // Make sure it's not null
        validate: {
            notNull: { msg: 'Type is required' },
            notEmpty: { msg: 'Type cannot be empty' },
        },
        updatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }
});

module.exports = propertyType;
