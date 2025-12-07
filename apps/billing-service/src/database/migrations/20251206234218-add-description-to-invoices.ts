import { Migration } from '../types/migration.types';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // Add description column to Invoices table
  await queryInterface.addColumn('Invoices', 'description', {
    type: DataTypes.STRING,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  
  // Remove description column from Invoices table
  await queryInterface.removeColumn('Invoices', 'description');
};
