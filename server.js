'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');


const PORT = process.env.PORT || 3001;

const { response } = require('express');
var client = jwksClient({
  jwksUri: 'https://dev-6r5dp3cc.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

app.get('/', (request, response) => {
  response.send('Hey look ma I made it');
  const token = request.headers.authorization.split(' ')[1];

  // the second part is from jet docs
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      response.status(500).send('invalid token');
    }
    res.send(user);
  });

  app.get('/profile', (request, response) => {
    response.send('Hey look ma I made it');
    const token = request.headers.authorization.split(' ')[1];

    // the second part is from jet docs
    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) {
        response.status(500).send('invlaid token');
      }
      res.send(user);
    
  })

    // TODO: 
    // STEP 1: get the jwt from the headers
    // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
    // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
    // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end

  });

  app.listen(PORT, () => console.log(`listening on ${PORT}`));
})
