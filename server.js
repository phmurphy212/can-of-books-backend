'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const BookModel = require('./models/books.js');

const PORT = process.env.PORT;

var client = jwksClient({
  jwksUri: 'https://dev-6r5dp3cc.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

app.get('/clear', clear);

app.get('/seed', seed);

app.get('/', (request, response) => {
  const token = request.headers.authorization.split(' ')[1];
  
  // the second part is from jet docs
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      response.status(500).send('invalid token');
    }
    response.send(user);
  });
});

app.get('/profile', (request, response) => {
  // response.send('Hey look ma I made it');
  const token = request.headers.authorization.split(' ')[1];
  
  // the second part is from jet docs
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      response.status(500).send('invalid token');
    }
    response.send(user);
  });
});

app.get('/books', async (request, response) => {
  try {
    let booksdb = await BookModel.find({});
    response.status(200).send(booksdb);
  }
  catch (err) {
    response.status(500).send('db error');
  }
});


mongoose.connect('mongodb://127.0.0.1:27017/book-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to the database');
  });

app.listen(PORT, () => console.log(`listening on ${PORT}`));

async function addBook(obj) {
  let newBook = new BookModel(obj);
  return await newBook.save();
}

async function clear(request, response) {
  try {
    await BookModel.deleteMany({});
    response.status(200).send('Bombed the DBase');
  }
  catch (err) {
    response.status(500).send('Error in clearing database');
  }
}

async function seed(request, response) {
  let books = await BookModel.find({});
  if (books.length === 0) {
    await addBook({ title: 'Playing For Keeps', email: 'brook@codefellows.com', description: 'David Halberstam describes Michael Jordan after his second retirement from the NBA. He discusses his relationships with the likes of Phil Jackson, Scottie Pippen, and other people of within the Chicago Bulls dynasty', status: 'FAVORITE FIVE' });
    await addBook({ title: 'The Jordan Rules', email: 'brook@codefellows.com', description: 'Sam Smith goes into a lot of the darker elements of Michael Jordan\'s life and career. He discusses gambling, anger, and some of the parts of Michael Jordan that didn\'t make it to the public eye', status: 'FAVORITE FIVE' });
    await addBook({ title: 'The Book of Basketball', email: 'brook@codefellows.com', description: 'Bill Simmons breaks down the top 100 NBA players of all time. He splits the top 1-- into several different levels on his pyramid of greatness. At the top of the period lies the pantheon, the greatest of the greatest playrs of all time', status: 'FAVORITE FIVE' });
  }
  response.send('Seeded The Database');
}
