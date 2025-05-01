# Modernize Nuxt.js Frontend

A modern dashboard UI built with Nuxt.js and Vuetify, featuring a clean, responsive design and ready for API integration.

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose

### Setup & Run

1. Create a `.env` file in the project root
   ```bash
   # Create .env file with required configuration
   FRONTEND_CONTAINER_NAME=fses_frontend
   FRONTEND_PORT=8001
   API_BASE_URL=http://localhost:8080/api
   ```

2. Start the Docker container
   ```bash
   docker-compose up
   ```

3. Access the application at: http://localhost:8001