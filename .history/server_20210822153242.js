'use strict';
const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/book-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to the database');
});

require('dotenv').config();


const BookModel = require('./models/books.js');
const PORT = process.env.PORT;

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
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

app.get('/books', (request, response) => {
  try {
    const token = request.headers.authorization.split(' ')[1];
    const email = request.query.email;
    // the second part is from jet docs
    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) {
        response.status(500).send('invalid token');
      } else if (user.email !== email){
        response.status(404).send('Not Authorized')
      }
      BookModel.find({email}, (error, booksData)=> {
        response.status(200).send(booksData);
      });
    });
  }
  catch (err) {
    response.status(500).send('db error');
  }
});

app.post('/books', (request, response) => {
  let { title, status, description, email } = request.body;
  let newBook = new BookModel({title, status, description, email});
  newBook.save();

  response.send(newBook);
})

app.delete('/books/:id', async (request, response) => {
  let bookId = request.query.id;
  console.log(bookId);
  await BookModel.findByIdAndDelete(bookId);
  let booksdb = await BookModel.find({});
  console.log(booksdb);
  response.send(`successfully deleted`);
})


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

app.listen(PORT, () => console.log(`listening on ${PORT}`));
