import { Router } from 'express';
import textRoutes from './textRoutes';

const router = Router();

router.use('/text', textRoutes);
// Add other domain routes here

export default router;
