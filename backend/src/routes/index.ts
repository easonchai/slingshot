import { Router } from 'express';
import WelcomeRouter from './Welcome';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/welcome', WelcomeRouter);

// Export the base-router
export default router;
