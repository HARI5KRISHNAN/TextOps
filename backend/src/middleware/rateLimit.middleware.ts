import rateLimit from 'express-rate-limit';
// FIX: Import the `Request` type from express to handle the request object correctly.
import type { Request } from 'express';

// General API limiter for most routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Stricter rate limit for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 failed login attempts per 15 minutes
  message: { message: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true, // Don't count successful authentications
});

// Rate limit for sending messages
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 messages per minute
  message: { message: 'You are sending messages too frequently. Please wait a moment.' },
  // Use the user ID from the request body as the key
  keyGenerator: (req: Request) => {
    // FIX: Explicitly type `req` as Express's `Request` to allow access to `body` and `ip` properties.
    return req.body.userId || req.ip;
  },
});
