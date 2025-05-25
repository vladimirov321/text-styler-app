import { Router } from 'express';
import { TextController } from '../controllers/textController';

const router = Router();
const textController = new TextController();

// GET /api/text/improve-text?text=some%20text
router.get('/improve-text', textController.handleImproveText);

export default router;
