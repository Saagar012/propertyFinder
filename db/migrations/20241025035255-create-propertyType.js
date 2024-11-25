// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('propertyType', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       type: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         validate: {
//           notNull: { msg: 'Type is required' },
//           notEmpty: { msg: 'Type cannot be empty' },
//         },
//       },
//       updatedOn: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.NOW,
//       },
//       createdOn: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.NOW,
//       },
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable('propertyType');
//   },
// };
