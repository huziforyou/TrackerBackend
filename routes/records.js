const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { location, browserInfo, selfie } = req.body;
    
    // Use default location if not provided
    const recordLocation = {
      latitude: Number(location?.latitude || 0),
      longitude: Number(location?.longitude || 0)
    };
    
    const selfieValue = selfie || 'placeholder.jpg';
    
    const record = new Record({
      selfie: selfieValue,
      location: recordLocation,
      browserInfo: browserInfo || {}
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
