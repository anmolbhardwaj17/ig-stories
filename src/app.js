const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friend');
const storyRoutes = require('./routes/story');

app.use('/user', userRoutes);
app.use('/friend', friendRoutes);
app.use('/story', storyRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
