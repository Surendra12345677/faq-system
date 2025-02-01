const { createClient } = require("redis")

class CacheService {
    constructor() {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
        
        this.client = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log("Max reconnection attempts reached. Using fallback mode.")
                        return new Error("Max reconnection attempts reached")
                    }
                    return Math.min(retries * 100, 3000)
                }
            }
        })

        this.client.on("error", (err) => {
            if (err.code === "ECONNREFUSED") {
                console.warn("Redis connection failed - ensure Redis server is running")
            } else {
                console.error("Redis error:", err.message)
            }
        })

        this.client.on("connect", () => {
            console.log("Redis connected successfully")
        })

        this.client.on("reconnecting", () => {
            console.log("Attempting to reconnect to Redis...")
        })

        // Track connection state
        this.isConnected = false
    }

    async connect() {
        if (!this.isConnected) {
            try {
                await this.client.connect()
                this.isConnected = true
            } catch (err) {
                console.warn("Failed to connect to Redis, using fallback mode")
                this.isConnected = false
            }
        }
    }

    async get(key) {
        try {
            if (!this.isConnected) {
                return null
            }
            return await this.client.get(key)
        } catch (err) {
            console.warn("Cache GET failed:", err.message)
            return null
        }
    }

    async set(key, value, expiration = 3600) {
        try {
            if (!this.isConnected) {
                return false
            }
            await this.client.set(key, value, { EX: expiration })
            return true
        } catch (err) {
            console.warn("Cache SET failed:", err.message)
            return false
        }
    }

    async close() {
        if (this.isConnected) {
            try {
                await this.client.quit()
                this.isConnected = false
                console.log("Redis disconnected")
            } catch (err) {
                console.error("Error while disconnecting Redis:", err.message)
            }
        }
    }
}

// Create singleton instance
const cacheService = new CacheService()

// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nGracefully shutting down...")
    await cacheService.close()
    process.exit(0)
})

module.exports = cacheService


