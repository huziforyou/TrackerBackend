const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

// Temporary: For now, we'll skip file uploads and just store data
// In production, use cloud storage like S3/Cloudinary
router.post('/', express.json(), async (req, res) => {
  try {
    const { location, browserInfo } = req.body;
    const record = new Record({
      selfie: 'placeholder.jpg', // Temporary placeholder
      location: location,
      browserInfo: browserInfo
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await Record.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
