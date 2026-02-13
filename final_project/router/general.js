const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Register new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });

  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});


// ✅ Get all books using async/await with Axios
public_users.get('/asyncbooks', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const book_keys = Object.keys(books);

  const books_by_author = book_keys.filter(key =>
    books[key].author === author
  ).map(key => books[key]);

  return res.status(200).send(JSON.stringify(books_by_author, null, 4));
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const book_keys = Object.keys(books);

  const books_by_title = book_keys.filter(key =>
    books[key].title === title
  ).map(key => books[key]);

  return res.status(200).send(JSON.stringify(books_by_title, null, 4));
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
