const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Show us what you gots');
});

app.listen(port, () => {
  console.log(`App listenting on local port ${port}`);
});