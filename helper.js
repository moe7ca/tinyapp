//check if user already exists
const getUserByEmail = function(email, database) {
  const values = Object.values(database);

  for (const user of values) {
    if(user.email === email) {
      return user;
    }
  }
      return null;
}

//acquire url for User
const urlsForUser = function(id, urlDatabase) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if(url.userID === id) {
      results[shortURL] = url;
    }
  }
  return results;
}

module.exports = { getUserByEmail, urlsForUser};