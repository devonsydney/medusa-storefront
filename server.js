const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev')); // Use morgan middleware with 'dev' format

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log('Serving with express!');
  console.log(`http://localhost:${PORT}`);
});