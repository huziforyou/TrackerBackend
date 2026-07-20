const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Record = require('../models/Record');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('selfie'), async (req, res) => {
  try {
    const { location, browserInfo } = req.body;
    const record = new Record({
      selfie: req.file.filename,
      location: JSON.parse(location),
      browserInfo: JSON.parse(browserInfo)
    });
    await record.save();
    if (req.io) {
      req.io.emit('newRecord', record);
    }
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await Record.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
