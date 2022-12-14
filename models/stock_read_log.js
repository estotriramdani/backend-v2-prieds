var mongoose = require('mongoose');

const db = require('../mongodb');
const baseSchema = require('./base_schema');

const Schema = mongoose.Schema(
  {
    ...baseSchema,
  },
  { collection: 'stock_read_log' }
);

module.exports = db.model('stock_read_log', Schema);
