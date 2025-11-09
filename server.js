import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Base URLs for anime data sources
const CONSUMET_API = "https://api.consumet.org"
const JIKAN_API = "https://api.jikan.moe/v4"

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Anime API is running",
    endpoints: {
      search: "/api/search?query=naruto",
      animeInfo: "/api/anime/:id",
      episodes: "/api/episodes/:id",
      stream: "/api/stream/:episodeId",
      download: "/api/download/:episodeId",
      trending: "/api/trending",
      recent: "/api/recent",
      popular: "/api/popular",
      genre: "/api/genre/:genre",
    },
  })
})

// Search anime
app.get("/api/search", async (req, res) => {
  try {
    const { query, page = 1 } = req.query

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" })
    }

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/${query}`, {
      params: { page },
    })

    res.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to search anime",
      message: error.message,
    })
  }
})

// Get anime info by ID
app.get("/api/anime/:id", async (req, res) => {
  try {
    const { id } = req.params

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/info/${id}`)

    res.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch anime info",
      message: error.message,
    })
  }
})

// Get episodes for anime
app.get("/api/episodes/:id", async (req, res) => {
  try {
    const { id } = req.params

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/info/${id}`)

    const episodes = response.data.episodes || []

    res.json({
      success: true,
      totalEpisodes: episodes.length,
      data: episodes,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch episodes",
      message: error.message,
    })
  }
})

// Stream anime episode with quality options
app.get("/api/stream/:episodeId", async (req, res) => {
  try {
    const { episodeId } = req.params

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/watch/${episodeId}`)

    const sources = response.data.sources || []
    const qualities = sources.map((source) => ({
      quality: source.quality,
      url: source.url,
      isM3U8: source.isM3U8,
    }))

    res.json({
      success: true,
      episodeId,
      sources: qualities,
      headers: response.data.headers || {},
      download: response.data.download || null,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get streaming links",
      message: error.message,
    })
  }
})

// Download anime episode in different qualities
app.get("/api/download/:episodeId", async (req, res) => {
  try {
    const { episodeId } = req.params
    const { quality = "default" } = req.query

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/watch/${episodeId}`)

    const sources = response.data.sources || []
    const downloadLink = response.data.download || null

    // Filter by quality if specified
    let selectedSource
    if (quality !== "default") {
      selectedSource = sources.find((s) => s.quality === quality)
    }

    if (!selectedSource && sources.length > 0) {
      selectedSource = sources[0]
    }

    res.json({
      success: true,
      episodeId,
      quality: selectedSource?.quality || "N/A",
      downloadUrl: selectedSource?.url || downloadLink,
      allQualities: sources.map((s) => ({
        quality: s.quality,
        url: s.url,
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get download links",
      message: error.message,
    })
  }
})

// Get trending anime
app.get("/api/trending", async (req, res) => {
  try {
    const { page = 1 } = req.query

    const response = await axios.get(`${JIKAN_API}/top/anime`, {
      params: { page },
    })

    res.json({
      success: true,
      data: response.data.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending anime",
      message: error.message,
    })
  }
})

// Get recent episodes
app.get("/api/recent", async (req, res) => {
  try {
    const { page = 1, type = 1 } = req.query

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/recent-episodes`, {
      params: { page, type },
    })

    res.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent episodes",
      message: error.message,
    })
  }
})

// Get popular anime
app.get("/api/popular", async (req, res) => {
  try {
    const { page = 1 } = req.query

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/top-airing`, {
      params: { page },
    })

    res.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch popular anime",
      message: error.message,
    })
  }
})

// Get anime by genre
app.get("/api/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params
    const { page = 1 } = req.query

    const response = await axios.get(`${CONSUMET_API}/anime/gogoanime/genre/${genre}`, {
      params: { page },
    })

    res.json({
      success: true,
      genre,
      data: response.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch anime by genre",
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

