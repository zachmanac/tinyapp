const { getUserByEmail, urlsForUser } = require("./helpers");
const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcryptjs = require("bcryptjs");
const salt = bcryptjs.genSaltSync(10);


const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': {
    // shortURL: 'b2xVn2',
    userID: 'userRandomID',
    longURL: 'http://www.lighthouselabs.ca'
  },
  '9sm5xK': {
    // shortURL: '9sm5xK',
    userID: 'user2RandomID',
    longURL: 'http://www.google.com'
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcryptjs.hashSync("purple-monkey-dinosaur", salt),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcryptjs.hashSync("dishwasher-funk", salt),
  },
};

// const getUserByEmail = function(users, email) {
//   for (let userID in users) {
//     if (email === users[userID].email) {
//       return users[userID];
//     }
//   }
// };

// const urlsForUser = function(id, urlDatabase) {
//   const urls = {};
//   for (let url in urlDatabase) {
//     if (id === urlDatabase[url].userID) {
//       urls[url] = urlDatabase[url];
//     }
//   }
//   return urls;
// };

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session_id',
  keys: ['sample_session_key']
}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send(`Please register and/or login to view page.\n`);
  }
  const templateVars = {
    user: users[userID],
    urls: urlsForUser(userID, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if(!userID) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if(!userID) {
    return res.status(401).send(`Please register and/or login to view page.\n`);
  }
  if(!urlDatabase[req.params.id]) {
    return res.status(404).send(`Short URL for ${req.params.id} does not exist\n`);
  }
  if (!userURLS[shortURL]) {
    return res.status(401).send(`You do not own this URL.\n`);
  }
  const templateVars = {
    user: users[userID],
    id: req.params.id,
    // shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(404).send(`That shortURL does not exist.`);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  if(!req.session.user_id) {
    return res.status(401).send("Cannot shorten URLS without being logged in.\n");
  }
  const newURLID = generateRandomString();
  const newURL = {
    userID: req.session.user_id,
    longURL: req.body.longURL
  };
  urlDatabase[newURLID] = newURL;
  res.redirect(`/urls/${newURLID}`);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if(!urlDatabase[req.params.id]) {
    return res.status(404).send(`Short URL for ${req.params.id} does not exist\n`);
  }
  if (!userURLS[shortURL]) {
    return res.status(401).send(`You do not own this URL.\n`);
  }
  if(!userID) {
    return res.status(401).send(`Please register and/or login to view page.\n`);
  }
  const longURL = req.body.longURL;
  const changedURL = {
    // shortURL,
    longURL
  };
  urlDatabase[shortURL].longURL = changedURL.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if(!urlDatabase[req.params.id]) {
    return res.status(404).send(`Short URL for ${req.params.id} does not exist\n`);
  }
  if (!userURLS[shortURL]) {
    return res.status(401).send(`You do not own this URL.\n`);
  }
  if(!userID) {
    return res.status(401).send(`Please register and/or login to view page.\n`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  if (!emailEntered || !passwordEntered) {
    return res.status(400).send('Both fields must be filled in to login.');
  }
  const user = getUserByEmail(users, req.body.email);
  console.log("passwordentered", passwordEntered);
  console.log("user.password", user.password);
  console.log("bcryptjs", bcryptjs.compareSync(passwordEntered, user.password))
  if (!user) {
    return res.status(403).send(`Account with ${emailEntered} not found.`);
  }
  if (!bcryptjs.compareSync(passwordEntered, user.password)) {
    return res.status(403).send("Password entered is incorrect.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: bcryptjs.hashSync(req.body.password, salt)
  };
  if (getUserByEmail(users, req.body.email) !== undefined) {
    return res.status(400).send(`Account with ${newUser.email} already registered.`);
  }
  if (!newUser.email || !newUser.password) {
    return res.status(400).send("Both fields must be filled in to register.");
  }
  users[newUserID] = newUser;
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});