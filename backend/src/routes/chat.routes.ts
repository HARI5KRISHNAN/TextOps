import express from 'express';
import { getMessages, sendMessage } from '../controllers/chat.controller';
import { validateMessage, validationErrorHandler } from '../middleware/validation.middleware';
import { messageLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

router.get('/:channelId/messages', getMessages);

router.post(
  '/:channelId/messages', 
  messageLimiter,         // Apply specific rate limiting for sending messages
  validateMessage,        // Validate the input
  validationErrorHandler, // Handle any validation errors
  sendMessage             // Proceed to the controller if valid
);

export default router;
