import express from 'express';
import booksRouter from './books.js';
import chaptersRouter from './chapters.js';

const router = express.Router();

router.use('/books', booksRouter);
router.use('/', chaptersRouter);

export default router;
