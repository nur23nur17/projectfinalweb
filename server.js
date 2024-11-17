require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const initializeAdmin = require("./routes/initializeAdmin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB successfully connected'))
    .catch((err) => console.error('MongoDB connection failed', err));

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

initializeAdmin();
