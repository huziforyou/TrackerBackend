const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { location, browserInfo, selfie } = req.body;
    
    // Validate required fields
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Location is required with latitude and longitude' });
    }
    
    const selfieValue = selfie || 'placeholder.jpg';
    
    const record = new Record({
      selfie: selfieValue,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
      },
      browserInfo: browserInfo
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
