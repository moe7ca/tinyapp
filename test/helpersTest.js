const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helper.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, undefined);
  });

  it('should return urls for valid user', function() {
    const user = urlsForUser("aJ48lW", urlDatabase)
    const expectedUrls = {
      b6UTxQ: {
          longURL: "https://www.tsn.ca",
          userID: "aJ48lW"
      },
      i3BoGr: {
          longURL: "https://www.google.ca",
          userID: "aJ48lW"
      }
    };
    assert.deepEqual(user, expectedUrls);
  });

  it('should return empty object for invalid user', function() {
    const user = urlsForUser("aJlW", urlDatabase)
    const expectedUrls = {}
    assert.deepEqual(user, expectedUrls);
  });


});