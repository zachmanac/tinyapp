const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });
  it('should return undefined if non-existant email address', function() {
    const user = getUserByEmail(testUsers, "usertestwrong@example.com")
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });
});

const testurlDatabase = {
  'b2xVn2': {
    userID: 'userRandomID',
    longURL: 'http://www.lighthouselabs.ca'
  },
  '9sm5xK': {
    userID: 'user2RandomID',
    longURL: 'http://www.google.com'
  }
};

describe('urlsForUser', function() {
  it('should return URLs for a given userID', function() {
    const urls = urlsForUser("userRandomID", testurlDatabase)
    const expectedurls = {
                          'b2xVn2': {
                            userID: 'userRandomID',
                            longURL: 'http://www.lighthouselabs.ca'
                            }
                          }
    assert.deepEqual(urls, expectedurls);
  });
  it('should return an empty object if userID has no URLs', function() {
    const urls = urlsForUser("testID", testurlDatabase)
    const expectedurls = {};
    assert.deepEqual(urls, expectedurls);
  });
});


