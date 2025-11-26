import { body, query, ValidationChain } from 'express-validator';

export const generateImageValidation: ValidationChain[] = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isString()
    .withMessage('Prompt must be a string')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Prompt must be between 1 and 4000 characters'),

  body('size')
    .optional()
    .isIn(['1024x1024', '1792x1024', '1024x1792'])
    .withMessage('Size must be one of: 1024x1024, 1792x1024, 1024x1792'),

  body('quality')
    .optional()
    .isIn(['standard', 'hd'])
    .withMessage('Quality must be either standard or hd'),

  body('style')
    .optional()
    .isIn(['vivid', 'natural'])
    .withMessage('Style must be either vivid or natural'),
];

export const getGenerationsValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
    .toInt(),

  query('status')
    .optional()
    .isIn(['success', 'failed', 'pending'])
    .withMessage('Status must be one of: success, failed, pending'),

  query('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string')
    .trim(),
];
