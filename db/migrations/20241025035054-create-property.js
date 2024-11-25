'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('property', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM('RENT', 'SALE'),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      streetAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bedrooms: {
        type: Sequelize.INTEGER,
      },
      bathrooms: {
        type: Sequelize.INTEGER,
      },
      parkingSpots: {
        type: Sequelize.INTEGER,
      },
      amenities: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
      },
      propertyImage: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      priceAmountPerAnnum: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('AVAILABLE', 'SOLD', 'RENTED', 'EXPIRED'),
        defaultValue: 'AVAILABLE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      propertyType: {
        type: Sequelize.ENUM('HOUSE', 'APARTMENT', 'COMMERCIAL'),
        allowNull: false,
      },
      contactInfo: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('property');
  },
};
