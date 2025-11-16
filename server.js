const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to completely replace all Samuel Rebix data
function replaceAllCreatorData(data) {
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const newItem = {};
        for (const key in item) {
          if (key === 'creator' || key === 'author') {
            newItem[key] = 'lostboy';
          } else if (key === 'uploader' || key === 'owner') {
            newItem[key] = 'lostboy';
          } else if (typeof item[key] === 'string') {
            // Replace Samuel Rebix in any string field
            newItem[key] = item[key].replace(/Samuel Rebix/gi, 'lostboy');
          } else {
            newItem[key] = replaceAllCreatorData(item[key]);
          }
        }
        return newItem;
      }
      return item;
    });
  } else if (typeof data === 'object' && data !== null) {
    const newData = {};
    for (const key in data) {
      if (key === 'creator' || key === 'author') {
        newData[key] = 'lostboy';
      } else if (key === 'uploader' || key === 'owner') {
        newData[key] = 'lostboy';
      } else if (typeof data[key] === 'string') {
        // Replace Samuel Rebix in any string field
        newData[key] = data[key].replace(/Samuel Rebix/gi, 'lostboy');
      } else {
        newData[key] = replaceAllCreatorData(data[key]);
      }
    }
    return newData;
  }
  return data;
}

// Anime Search - GET
app.get('/anime/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await axios.get(`https://api-rebix.vercel.app/api/anisearch?q=${encodeURIComponent(q)}`);
    
    let results = response.data || [];
    results = replaceAllCreatorData(results);
    
    const finalResponse = {
      results: results,
      info: {
        creator: 'lostboy',
        query: q,
        source: 'Anime Search'
      }
    };
    
    res.json(finalResponse);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to search anime',
      creator: 'lostboy'
    });
  }
});

// Anime Download - GET
app.get('/anime/download', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Query parameter "url" is required' });
    }

    const response = await axios.get(`https://api-rebix.vercel.app/api/anidl?url=${encodeURIComponent(url)}`);
    
    let results = response.data || {};
    results = replaceAllCreatorData(results);
    
    const finalResponse = {
      results: results,
      info: {
        creator: 'lostboy',
        url: url,
        source: 'Anime Download'
      }
    };
    
    res.json(finalResponse);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to download anime',
      creator: 'lostboy'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    owner: 'lostboy',
    endpoints: {
      anime_search: '/anime/search?q=boruto',
      anime_download: '/anime/download?url=https://www.bilibili.tv/id/video/4786363859209728'
    },
    status: 'active',
    creator: 'lostboy'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Owner: lostboy');
});

module.exports = app;
