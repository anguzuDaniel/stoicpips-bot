
const express = require('express');
import cors from "cors";

const authRoutes = require('./routes/auth.routes');
const botRoutes = require('./routes/bot.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bot', botRoutes);
app.use('/api/v1/user', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});