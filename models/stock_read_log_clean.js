var mongoose = require('mongoose');

const db = require('../mongodb');
const baseSchema = require('./base_schema');

const Schema = mongoose.Schema(
  {
    ...baseSchema,
    qty: Number,
  },
  { collection: 'stock_read_log_clean' }
);

module.exports = db.model('stock_read_log_clean', Schema);
