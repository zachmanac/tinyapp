const getUserByEmail = function(users, email) {
  for (let userID in users) {
    if (email === users[userID].email) {
      return users[userID];
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

module.exports = {
  getUserByEmail,
  urlsForUser
};