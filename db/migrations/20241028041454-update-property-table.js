'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('property', 'category', {
      type: Sequelize.ENUM('RENT', 'SALE'),
      allowNull: false,
      defaultValue:'SALE',
      validate: {
        notNull: { msg: 'Category cannot be null' },
      },
    });

    await queryInterface.addColumn('property', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'zipCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'streetAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'bedrooms', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('property', 'bathrooms', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('property', 'parkingSpots', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('property', 'amenities', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'contactInfo', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('property', 'priceAmountPerAnnum', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      validate: {
        notNull: { msg: 'Price amount cannot be null' },
        isDecimal: { msg: 'Price must be a decimal value' },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('property', 'category');
    await queryInterface.removeColumn('property', 'country');
    await queryInterface.removeColumn('property', 'city');
    await queryInterface.removeColumn('property', 'zipCode');
    await queryInterface.removeColumn('property', 'streetAddress');
    await queryInterface.removeColumn('property', 'bedrooms');
    await queryInterface.removeColumn('property', 'bathrooms');
    await queryInterface.removeColumn('property', 'parkingSpots');
    await queryInterface.removeColumn('property', 'amenities');
    await queryInterface.removeColumn('property', 'contactInfo');
    await queryInterface.removeColumn('property', 'priceAmountPerAnnum');
  },
};
