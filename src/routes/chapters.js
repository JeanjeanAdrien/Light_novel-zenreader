import express from 'express';
import { getChapter, getChapters } from '../controllers/chapterController.js';

const router = express.Router();

// Matches /api/chapters
router.get('/chapters', getChapters);

// Matches /api/chapter
router.get('/chapter', getChapter);

export default router;
