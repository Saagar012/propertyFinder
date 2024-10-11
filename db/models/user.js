'use strict';
const {
  DataTypes
} = require('sequelize');
const bcrypt = require("bcrypt");


const sequelize = require('../../config/database');

module.exports = sequelize.define('user',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.STRING
    },
    userType: {
      type: DataTypes.ENUM('0','1','2')
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    confirmPassword:{
      type: DataTypes.VIRTUAL,
      set(value){
        if(value === this.password){
          const hashPassword = bcrypt.hashSync(value,10);
          this.setDataValue('password',hashPassword);  
        } else {
          throw new Error("Password and confirm password must be same");
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
)