import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import botRoutes from './routes/bot.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

app.use(cors({
  origin: true, // Reflect request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bot', botRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 Global Error:", err);

  // Ensure CORS headers even on error
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    status: status
  });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});