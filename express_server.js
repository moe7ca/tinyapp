const bodyParser = require("body-parser");
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

// helper
const { getUserByEmail, urlsForUser } = require('./helper');
// creating an Express app
const app = express();
const PORT = 8080;

// cookie session config
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

// setting ejs as the template engine
app.set('view engine', 'ejs');

// starting URL Data
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

// starter User Data
const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "123"
  },
  "2dujjd": {
    id: "2dujjd", 
    email: "user2@example.com", 
    password: "123"
  }
}

// shortURL
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return result;
}

// interface
app.get('/', (request, response) => {
  response.redirect(`/urls`);});

app.get('/urls', (request, response) => {

  if (!request.session.userID) {
    const templateVars = { 
      urls : urlDatabase,
      user: users[request.session.userID]
    }; 
    return response.redirect(`/login`);
  }

  const templateVars = { 
    urls : urlsForUser(request.session.userID, urlDatabase),
    user: users[request.session.userID]
  }; 
  response.render('urls_index', templateVars);
});


  // content of the form is contained in an object call req.body
  // req.body is given by the bodyParser middleware
app.post("/urls", (request, response) => {
  const shortURL = generateRandomString();
  const userObj = users[request.session.userID]; //users
  const longURL = request.body.longURL;
  console.log('before: ', urlDatabase);
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userObj.id;
  console.log('after: ', urlDatabase);
  response.redirect(`/urls/${shortURL}`);
 });
 
// reate New URL if user doesn't exist
app.get('/urls/new', (request, response) => {
  if (!request.session.userID) {
    return response.redirect(`/login`);
  }
  const email = request.body.email;
  // if (getUserByEmail(email, users) === email) {
    const templateVars = { 
      user: users[request.session.userID] 
    // }; 
  } 
  return response.render('urls_new', templateVars);

});

 // key longURL = value of longURL through urlDatabase[shortURL]

 app.get("/urls/:shortURL", (request, response) => {
  const userID = request.session.userID;
  console.log('userID:', userID)
  const shortURL = request.params.shortURL;
  const url = urlDatabase[shortURL];

  if (url === undefined) {
    return response.status(400).send("Invalid");
  }

  if (url.userID !== userID) {
    return response.status(401).send("Please logged in!");
  }

  console.log('shortURL: ',shortURL);
  const templateVars = { 
    shortURL, 
    longURL: url.longURL,
    user: users[userID]
  };
  response.render("urls_show", templateVars);
});

// redirect to the website
app.get("/u/:shortURL", (request, response) => {
  const shortURL = request.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return response.status(404).send("404 page not found");
  } 
  
  const longURL = url.longURL;
  return response.redirect(longURL);
});


 // deletes from urlDatabase
app.post("/urls/:shortURL/delete", (request, response) => {
  const shortURL = request.params.shortURL;
  const shortURLObj = urlDatabase[shortURL];

  if (shortURLObj.userID === request.session.userID) {
    delete urlDatabase[shortURL];
    return response.redirect(`/urls`);
  } else {
    return response.status(403).send("403 Forbidden");
  }
});


// updating the urlDatabase
app.post("/urls/:id", (request, response) => {


  const shortURL = request.params.id;
  const urlID = urlDatabase[shortURL].userID;
  const IDfromBrowser = request.session.userID;

  if (urlID === IDfromBrowser) {
    const shortURL = request.params.id;
    urlDatabase[shortURL].longURL = request.body.longURL;
    response.redirect(`/urls`);
  } else {
    const templateVars = { 
      urls : urlDatabase,
      user: users[request.session.userID]
    }; 
    return response.render('must_login', templateVars);
    // response.status(404).send("404 page not found");
  }
});

// login
app.get("/login", (request, response) => {
  const userID = request.session.userID;

  const templateVars = { 
    user: null
  }; 
  response.render("login", templateVars);
});

// authenticate the user
app.post("/login", (request, response) => {
  console.log('request.body.email: ', request.body.email)
  const email = request.body.email;
  const password = request.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return response.status(401).send("Please Check Credentials");
  }

  bcrypt.compare(password, user.password, (err, success) => {
    if (!success) {
      return response.status(403).send("Forbidden - Please Check Credentials");
    }

    request.session.userID = user.id;
    response.redirect(`/urls`);
  })
});


// logut 
app.post("/logout", (request, response) => {
  // clear the cookie
  request.session = null;
  response.redirect(`/urls`);
});

// display the register form
app.get("/register", (request, response) => {
  const templateVars = { 
  user: users[request.session.userID]
  }; 
  response.render("urls_register", templateVars);
});

 // register extract the email and password from the form
app.post("/register", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  if (email === '' || password === '') {
    return response.status(404).send("Missing Email or Password");
  } 

  const user = getUserByEmail(email, users);
  if (user) {
    return response.status(404).send("Email alrady exists");
  }

  const id = generateRandomString();

  const hashedPassword = bcrypt.genSalt(10, (err, salt) => {
    console.log('my salt: ', salt);
    bcrypt.hash(password, salt, (error, hash) => {
    console.log('my hash: ', hash);
    users[id] = {
      id,
      email,
      password: hash,
    };
    request.session.userID = users[id].id;
    response.redirect(`/urls`);
    })
  })

});

// urlDatabase objects
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase)
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
})

app.listen(PORT, () => {
  console.log(`Example app listenting on port ${PORT}`);
});

