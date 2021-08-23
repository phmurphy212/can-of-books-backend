'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, uppercase: true, enum: ['LIFE-CHANGING', 'FAVORITE FIVE', 'RECOMMENDED TO ME'] },
});

const BookModel = mongoose.model('books', bookSchema);

module.exports = BookModel;
