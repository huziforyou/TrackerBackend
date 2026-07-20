const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const Record = require('../models/Record');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('selfie'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    const { location, browserInfo } = req.body;
    
    let parsedLocation, parsedBrowserInfo;
    
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      parsedBrowserInfo = typeof browserInfo === 'string' ? JSON.parse(browserInfo) : browserInfo;
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    
    // Validate required fields
    if (!parsedLocation || !parsedLocation.latitude || !parsedLocation.longitude) {
      return res.status(400).json({ message: 'Location is required with latitude and longitude' });
    }
    
    let selfieUrl = 'placeholder.jpg';
    
    // Upload image to Vercel Blob if file exists
    if (req.file) {
      console.log('Uploading to Vercel Blob...');
      const blob = await put(`selfie-${Date.now()}.png`, req.file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      selfieUrl = blob.url;
      console.log('Uploaded blob:', selfieUrl);
    }
    
    const record = new Record({
      selfie: selfieUrl,
      location: {
        latitude: Number(parsedLocation.latitude),
        longitude: Number(parsedLocation.longitude)
      },
      browserInfo: parsedBrowserInfo
    });
    
    console.log('Saving record:', record);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack
    });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Fetching records...');
    const records = await Record.find().sort({ timestamp: -1 });
    console.log('Found records:', records.length);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
