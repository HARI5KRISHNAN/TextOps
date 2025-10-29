import express from 'express';
import { generateSummary } from '../controllers/ai.controller';

const router = express.Router();

router.post('/generate-summary', generateSummary);

export default router;