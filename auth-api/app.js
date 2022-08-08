// Load the .env file
require('dotenv').config();

// Start expressjs with json support for our api/http stuff.
const express = require('express');
const mountRoutes = require('./routes');
const app = express();
app.use(express.json());
mountRoutes(app);

// Start our app.
app.listen(process.env.HTTP_PORT, () => {
  console.log(`PNH Auth. Listening on port ${process.env.HTTP_PORT}`)
})