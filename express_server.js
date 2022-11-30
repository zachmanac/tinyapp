const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': {shortURL: 'b2xVn2', longURL: 'http://www.lighthouselabs.ca'},
  '9sm5xK': {shortURL: '9sm5xK', longURL: 'http://www.google.com'}
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmailfunction = function(object) {
  const keys = Object.keys(object);
  const emails = [];
  for (const key of keys) {
    emails.push(object[key].email);
  };
  return emails;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    id: req.params.id,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
  };
  res.render("login", templateVars);
})

app.post("/urls", (req, res) => {
  const newURLID = generateRandomString();
  const newURL = {
    shortURL: newURLID,
    longURL: req.body.longURL
  };
  urlDatabase[newURLID] = newURL;
  res.redirect(`/urls/${newURLID}`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const changedURL = {
    shortURL,
    longURL
  };
  urlDatabase[shortURL] = changedURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const emails = getUserByEmailfunction(users);
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  if(!emailEntered || !passwordEntered) {
    return res.status(400).send('Both fields must be filled in to login.');
  };
  
  let foundUser = null;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === emailEntered) {
      foundUser = user;
    };
  };
  if(!foundUser) {
    return res.status(403).send(`Account with ${emailEntered} not found.`);
  };
  if(foundUser.password !== passwordEntered) {
    return res.status(403).send("Password entered is incorrect.");
  };
  
  res.cookie('user_id', foundUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  const emails = getUserByEmailfunction(users);
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  for (const email of emails) {
    if (newUser.email === email) {
      return res.status(400).send(`Account with ${email} already registered.`);
    };
  };
  if(newUser.email === "" || newUser.password === ""){
    return res.status(400).send("Both fields must be filled in to register.");
  };
  users[newUserID] = newUser;
  res.cookie('user_id', newUserID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});