const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
require("dotenv").config()

// Import routes
const faqRoutes = require("./src/routes/faq.routes")

// Create Express app
const app = express()

// Basic middleware setup
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())

// Root route to show API info
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to FAQ API",
    version: "1.0",
    endpoints: {
      faqs: "/api/faqs",
      health: "/health",
      docs: "/api-docs"  // if you add Swagger/OpenAPI docs later
    }
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    timestamp: new Date(),
    services: {
      server: "running",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    }
  })
})

// API routes
app.use("/api/faqs", faqRoutes)

// API 404 handler - for api routes only
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "API endpoint not found",
    availableRoutes: [
      "/api/faqs",
      "/health",
      "/"
    ]
  })
})

// Generic 404 handler - for all other routes
app.use("*", (req, res) => {
  // If request expects JSON
  if (req.accepts('json')) {
    res.status(404).json({ 
      error: "Route not found",
      tip: "Visit / for API information"
    })
    return
  }
  // If request expects HTML
  res.status(404).send("Page not found. Visit /api for API information.")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: "Something went wrong",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// DB connection
async function connectDB() {
  try {
    const dbUrl = process.env.MONGO_URI || "mongodb://localhost:27017/faqdb"
    await mongoose.connect(dbUrl)
    console.log("Connected to MongoDB")
  } catch (err) {
    console.log("MongoDB connection error:", err.message)
    process.exit(1)
  }
}

// Start server
const port = process.env.PORT || 3000

async function startServer() {
  await connectDB()
  
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(`API documentation available at http://localhost:${port}/api-docs`)
  })
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...")
  await mongoose.connection.close()
  console.log("MongoDB disconnected")
  process.exit(0)
})

// Initialize server
startServer()

module.exports = app