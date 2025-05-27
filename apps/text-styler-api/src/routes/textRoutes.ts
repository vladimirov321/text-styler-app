import { Router } from 'express';
import { TextController } from '../controllers/textController';

const router = Router();
const textController = new TextController();

router.get('/improve-text', textController.handleImproveText);

export default router;
