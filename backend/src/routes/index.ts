import { Router } from 'express';
import WelcomeRouter from './Welcome';
import ClubRouter from './Club';
import MeetingRouter from './Meeting';
import UserRouter from './User';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/welcome', WelcomeRouter);
router.use('/club', ClubRouter);
router.use('/meeting', MeetingRouter);
router.use('/user', UserRouter);

// Export the base-router
export default router;
