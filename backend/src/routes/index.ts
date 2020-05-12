import { Router } from 'express';
import WelcomeRouter from './Welcome';
import MeetingRouter from './Meeting';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/welcome', WelcomeRouter);
router.use('/meeting', MeetingRouter);

// Export the base-router
export default router;
