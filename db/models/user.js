'use strict';
const {
  DataTypes
} = require('sequelize');
const bcrypt = require("bcrypt");


const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const project = require('./project');
const property = require('./property');

const user = sequelize.define('user',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.STRING
    },
    userType: {
      type: DataTypes.ENUM('0','1','2'), 
      allowNull:false,
      validate:{
        notNull:{
          msg:'User type cannot be null'
        },
        notEmpty:{
          msg:'User type cannot be empty'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Email cannot be null',
        },
        notEmpty:{
          msg:'Email cannot be empty',
        },
        isEmail:{
          msg: 'Invalid email id',
        }
      },
    },
    password: {
      type: DataTypes.STRING
    },
    confirmPassword: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:'Password cannot be null',
        },
        notEmpty:{
          msg:'Password cannot be empty',
        },
      },
    },
    confirmPassword:{
      type: DataTypes.VIRTUAL,
      set(value){
        if(this.password.length < 7){
          throw new AppError('Password length must be greater than 7', 400);
        }
        if(value === this.password){
          const hashPassword = bcrypt.hashSync(value,10);
          this.setDataValue('password',hashPassword);  
        } else {
          throw new AppError("Password and confirm password must be same", 400);
        }
      }

    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  },{
    paranoid:true,
    freezeTableName: true,
    modelName:'user'
  }
);

user.hasMany(project, {foreignKey: 'createdBy'})
project.belongsTo(user, { 
  foreignKey:'createdBy',
});

user.hasMany(property, { foreignKey: 'userId' });
property.belongsTo(user, { foreignKey: 'userId' });

user.hasMany(property, { foreignKey: 'createdBy' });
property.belongsTo(user, { foreignKey: 'createdBy' });


module.exports = user;