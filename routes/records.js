const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const Record = require('../models/Record');

// Configure multer for memory storage (since we'll upload to Vercel Blob)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('selfie'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    const { location, browserInfo } = req.body;
    
    let parsedLocation, parsedBrowserInfo;
    
    try {
      parsedLocation = JSON.parse(location);
      parsedBrowserInfo = JSON.parse(browserInfo);
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
      const filename = `selfie-${Date.now()}.png`;
      const blob = await put(filename, req.file.buffer, {
        access: 'public',
      });
      selfieUrl = blob.url;
      console.log('Uploaded blob:', blob);
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
