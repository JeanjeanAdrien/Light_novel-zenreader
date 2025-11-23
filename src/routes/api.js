import express from 'express';
import { getChapter, getChapters, getBooks } from '../controllers/chapterController.js';

const router = express.Router();

router.get('/chapter', getChapter);
router.get('/chapters', getChapters);
router.get('/books', getBooks);

export default router;
