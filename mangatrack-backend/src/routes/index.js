const express = require('express');

const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const mangaRoutes = require('./manga.routes');
const reviewRoutes = require('./review.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mangas', mangaRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);

module.exports = router;
