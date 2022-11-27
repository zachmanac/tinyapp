const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function () {   
  return Math.random().toString(36).slice(2, 8); 
};

app.set("view engine", "ejs");

const urlDatabase = {};

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});