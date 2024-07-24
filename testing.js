const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    let ip = req.ip;
    res.send(`Your IP address is ${ip}`);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});