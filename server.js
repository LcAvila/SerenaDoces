require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 