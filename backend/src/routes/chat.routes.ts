import express from 'express';
import { getMessages, sendMessage } from '../controllers/chat.controller';

const router = express.Router();

router.get('/:channelId/messages', getMessages);
router.post('/:channelId/messages', sendMessage);

export default router;