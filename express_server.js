const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function () {   
  return Math.random().toString(36).slice(2, 8); 
};

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': {shortURL: 'b2xVn2', longURL: 'http://www.lighthouselabs.ca'},
  '9sm5xK': {shortURL: '9sm5xK', longURL: 'http://www.google.com'}
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    id: req.params.id,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newURLID = generateRandomString();
  const newURL = {
    shortURL: newURLID,
    longURL: req.body.longURL
  };
  urlDatabase[newURLID] = newURL;
  res.redirect(`/urls/${newURLID}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const changedURL = {
    shortURL,
    longURL
  };
  urlDatabase[shortURL] = changedURL;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});