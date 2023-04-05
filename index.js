// Requirements
const express = require('express');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Authentications
const { getCSRF } = require('./authentication/getCSRF.js');
const { setCookie } = require('./authentication/setCookie.js');

// Utilites
const { getUsers } = require('./util/getUsers.js');
const { getBalance } = require('./util/getBalance.js')

const app = express();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use(helmet());
app.use(bodyParser.json());
app.use(apiLimiter);

// Functions
function checkSecurityCode(req, res, next) {
  const securityCode = req.get('SECURITY_CODE');

  if (securityCode && securityCode === "SECRET_CODE") {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// API
app.post('/login', checkSecurityCode, (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const myCookie = cookies['.ROBLOSECURITY'];

  if (myCookie){
    return res.status(401).json({ error: 'Already Logged In' });
  }

  const sentcookie = req.get('.ROBLOSECURITY');

  if (!sentcookie) {
    return res.status(401).json({ error: 'No .ROBLOSECURITY found' });
  }

  let csrfToken;
  getCSRF(sentcookie)
    .then((token) => {
      csrfToken = token;
      return setCookie(sentcookie, csrfToken);
    })
    .then((user) => {
      res.setHeader('Set-Cookie', '.ROBLOSECURITY='+sentcookie);
      res.status(200).send('Cookie returned as ' + user.name + ` (${user.id})`);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

app.post('/logout', (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const myCookie = cookies['.ROBLOSECURITY'];

  if (myCookie){
    res.clearCookie('.ROBLOSECURITY');
    res.status(200).send('Logged out successfully');
  } else {
    res.status(500).send('Not Logged In');
  }
});

app.get('/users/:id?', checkSecurityCode, (req, res) => {
  const id = req.params.id;
  
  const cookies = cookie.parse(req.headers.cookie || '');
  const myCookie = cookies['.ROBLOSECURITY'];

  if (!id){

    if (!myCookie){
      res.status(500).send('Not logged In')
    }

    let csrfToken;
    getCSRF(myCookie)
      .then((token) => {
        csrfToken = token;
        return setCookie(myCookie, csrfToken);
      })
      .then((user) => {
        return getUsers(user.id);
      })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).send(err.message);
      });
  } else {
    getUsers(id)
    .then((data) => {
      res.status(200).json(data)
    })
  }
});

app.get('/balance', checkSecurityCode, (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const myCookie = cookies['.ROBLOSECURITY'];

  if (!myCookie){
    res.status(500).send('Not logged In')
  }

  let csrfToken;
  getCSRF(myCookie)
    .then((token) => {
      csrfToken = token;
      return setCookie(myCookie, csrfToken);
    })
    .then((user) => {
      return getBalance(myCookie, csrfToken);
    })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`);
});


  // https://catalog.roblox.com/docs/index.html?urls.primaryName=Catalog%20Api%20v1
  // https://thumbnails.roblox.com/docs/index.html
  // https://devforum.roblox.com/t/what-is-the-api-endpoint-for-buying-items-in-the-catalog/569144/10
  // https://www.roblox.com/catalog?Category=1&salesTypeFilter=2