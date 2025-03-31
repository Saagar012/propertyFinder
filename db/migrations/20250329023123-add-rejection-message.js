'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
       // Add the 'rejectionMessage' column to your table (replace 'YourTableName' with the actual table name)
       await queryInterface.addColumn('property', 'rejectionMessage', {
        type: Sequelize.TEXT,  // Use Sequelize.STRING if it's shorter text
        allowNull: true,       // Allow null value if no rejection message
        defaultValue: null,    // Optional: set default value to null
      });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
