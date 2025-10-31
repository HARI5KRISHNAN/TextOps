import { body, validationResult } from 'express-validator';
import xss from 'xss';

// Validation and sanitization chain for chat messages
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content cannot be empty.')
    .isLength({ max: 5000 }).withMessage('Message content cannot exceed 5000 characters.')
    // Sanitize for XSS. This will strip any HTML/script tags.
    .customSanitizer(value => {
        return xss(value);
    })
    // Escape characters like <, >, ", etc. to be safe when rendered
    .escape(),

  body('userId')
    .notEmpty().withMessage('User ID is required.')
    .isInt({ gt: 0 }).withMessage('Invalid User ID.'),
];

// Middleware to handle the result of the validation
export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};
