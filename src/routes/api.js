import express from 'express';
import { getChapter, getChapters } from '../controllers/chapterController.js';

const router = express.Router();

router.get('/chapter', getChapter);
router.get('/chapters', getChapters);

export default router;
