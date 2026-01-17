import express from 'express';
import Search from '../models/Search.js';

const router = express.Router();

// POST /api/search - Save a new search with Gemini result
router.post('/', async (req, res) => {
  try {
    const { userId, query, platforms, geminiResult } = req.body;

    if (!userId || !query || !geminiResult) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, query, geminiResult',
      });
    }

    const search = await Search.create({
      userId,
      query,
      platforms: platforms || [],
      geminiResult,
    });

    res.status(201).json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error creating search:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/history/:userId - Get recent searches for a user (latest first)
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const searches = await Search.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('query platforms createdAt');

    res.json({
      success: true,
      count: searches.length,
      data: searches,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/search/:id - Get full saved Gemini result by search ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const search = await Search.findById(id);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: 'Search not found',
      });
    }

    res.json({
      success: true,
      data: search,
    });
  } catch (error) {
    console.error('Error fetching search:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/search/:id - Delete a search
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const search = await Search.findByIdAndDelete(id);

    if (!search) {
      return res.status(404).json({
        success: false,
        error: 'Search not found',
      });
    }

    res.json({
      success: true,
      message: 'Search deleted',
    });
  } catch (error) {
    console.error('Error deleting search:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
