'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class List extends Model {
    static associate(models) {
    }
  }
  List.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    root_url: DataTypes.TEXT,
    short_url: DataTypes.TEXT,
    password: DataTypes.TEXT,
    access_number: DataTypes.INTEGER,
    safe_redirect: DataTypes.BOOLEAN,
    custom_path: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'List',
    tableName: 'lists',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return List;
};