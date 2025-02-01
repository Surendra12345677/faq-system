const redis = require('redis');
const logger = require('./logger');  // Assume we have a logger utility

class RedisManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: this._getReconnectStrategy()
                }
            });

            // Bind event handlers
            this._bindEventHandlers();
            
            await this.client.connect();
            this.isConnected = true;
            logger.info('Redis connected successfully');
        } catch (error) {
            logger.error('Redis connection failed:', error.message);
            throw error;
        }
    }

    _getReconnectStrategy() {
        return (retries) => {
            if (retries > 10) {
                logger.error('Max Redis reconnection attempts reached');
                return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
        };
    }

    _bindEventHandlers() {
        this.client.on('error', (err) => {
            logger.error('Redis error:', err.message);
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            logger.info('Attempting to reconnect to Redis...');
        });
    }

    async get(key) {
        if (!this.isConnected) return null;
        try {
            return await this.client.get(key);
        } catch (error) {
            logger.error('Redis GET failed:', error.message);
            return null;
        }
    }

    async set(key, value, expiration = 3600) {
        if (!this.isConnected) return false;
        try {
            await this.client.set(key, value, { EX: expiration });
            return true;
        } catch (error) {
            logger.error('Redis SET failed:', error.message);
            return false;
        }
    }

    async quit() {
        if (this.isConnected && this.client) {
            try {
                await this.client.quit();
                this.isConnected = false;
                logger.info('Redis disconnected successfully');
            } catch (error) {
                logger.error('Redis disconnect failed:', error.message);
            }
        }
    }
}

const redisManager = new RedisManager();

module.exports = redisManager;
