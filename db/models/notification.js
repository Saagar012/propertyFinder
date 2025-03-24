
const sequelize = require('../../config/database');
const { DataTypes } = require('sequelize');

const notification = sequelize.define('notifications', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'userId cannot be null',
            },
            isInt: {
                msg: 'userId must be an integer',
            },
        },
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'message cannot be null',
            },
            notEmpty: {
                msg: 'message cannot be empty',
            },
        },
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
            notNull: {
                msg: 'is_read cannot be null',
            },
            isIn: {
                args: [[true, false]],
                msg: 'is_read must be true or false',
            },
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            notNull: {
                msg: 'createdAt cannot be null',
            },
            isDate: {
                msg: 'createdAt must be a valid date',
            },
        },
    },
}, {
    timestamps: false,  // Set to true if you want updatedAt as well
    tableName: 'notifications',
});

module.exports = notification;
