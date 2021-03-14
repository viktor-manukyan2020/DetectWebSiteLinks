require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/routes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', apiRoutes);

app.listen(PORT, () => {
    console.log(`Running on PORT: ${PORT}`);
});
