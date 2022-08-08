// Load the .env file
require('dotenv').config();

// Start expressjs with json support for our api/http stuff.
const express = require('express');
const mountRoutes = require('./routes');
const app = express();
app.use(express.json());
mountRoutes(app);

// Send the readme.md file as a base64 string inside some html to render our markdown.
app.get("/", (req, res) => {
  res.send(`<!doctype html><html>
  <head>
    <meta charset="utf-8"/>
    <title>Readme.md</title>
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
    <style> body { grid-template-columns: 1fr min(80rem,90%) 1fr } blockquote p { margin: 0; } </style>
  </head>
  <body>
    <div id="content"></div>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
      document.getElementById('content').innerHTML =
        marked.parse(atob('${require('fs').readFileSync("readme.md").toString('base64')}'));
    </script>
  </body></html>`);
})

// Start our app.
app.listen(process.env.HTTP_PORT, () => {
  console.log(`PNH Auth. Listening on port ${process.env.HTTP_PORT}`)
})