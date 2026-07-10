import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (CUSTOMER, ARTIST, or ADMIN)
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), asyncHandler(authController.register));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and receive a JWT access token
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user profile details
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
