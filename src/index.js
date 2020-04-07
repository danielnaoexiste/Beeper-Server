require('./models/User')
require('./models/Post')
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const requireAuth = require('./middlewares/requireAuth')

const app = express();
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(authRoutes);
app.use(postRoutes);

const mongoUri = process.env.MONGO_URI

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB instance.')
});

mongoose.connection.on('error', (e) => {
    console.error('Error connecting to MongoDB instance: ', e);
});

app.get('/', requireAuth, (req, res) => {
    res.send(`Your email: ${req.user.email}`);
});

app.listen(port, () => {
    console.log('Listening on port', port);
});