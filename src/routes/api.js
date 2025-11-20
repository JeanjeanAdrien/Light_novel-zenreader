import express from 'express';
import { getChapter } from '../controllers/chapterController.js';

const router = express.Router();

router.get('/chapter', getChapter);

export default router;
