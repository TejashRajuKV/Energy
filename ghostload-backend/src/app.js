require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// ─── Route Imports ───────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const orgRoutes         = require('./routes/org.routes');
const siteRoutes        = require('./routes/site.routes');
const billRoutes        = require('./routes/bill.routes');
const scheduleRoutes    = require('./routes/schedule.routes');
const equipmentRoutes   = require('./routes/equipment.routes');
const analysisRoutes    = require('./routes/analysis.routes');
const scenarioRoutes    = require('./routes/scenario.routes');
const reportRoutes      = require('./routes/report.routes');
const contactRoutes     = require('./routes/contact.routes');
const profileRoutes     = require('./routes/profile.routes');

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for hackathon testing
  message: { error: 'Too many authentication attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ghostload-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/orgs',      orgRoutes);
app.use('/api/sites',     siteRoutes);
app.use('/api/bills',     billRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/analyses',  analysisRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/contact',   contactRoutes);
app.use('/api/profile',   profileRoutes);

// ─── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
