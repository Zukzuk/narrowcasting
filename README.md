# Komga Narrowcasting App

A Node.js narrowcasting application designed to serve and manage Komga book images with a simple REST API and frontend interface. This app is Docker-ready and includes configurations for both development and production environments.

## Installation

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/zukzuk/komga-narrowcasting-app.git
   ```
2. **Navigate to the project directory:**
   
   ```bash
   cd komga-narrowcasting-app
   ```
3. **Install dependencies:**
   
   ```bash
   npm install
   ```

## Project Structure

A Node.js narrowcasting app designed to display images from Komga using a backend Express API and a frontend interface.

## Folder Details

- **server/**: Backend code, Express API setup, routing, and utility modules.
- **public/**: Frontend assets, including HTML, JS and CSS, for displaying images and interacting with Komga data.
- **.deploy/**: Production-specific configuration files:
  - **.env**: Environment variables for production.
  - **docker-compose.yml**: Docker configuration for production deployment.
  - **Dockerfile**: Docker image setup for both development and production.
  - **docker-compose.dev.yml**: Configuration file for local development on `localhost:3001`.

## Production Environment

- Production settings are stored in `.deploy/.env` and `.deploy/docker-compose.yml`.
- Ensure these files are correctly configured before deploying to production.

### Environment Variables

Environment variables should be defined in an .env file for both development and production environments.

```plaintext
KOMGA_USERNAME2=          # Username for accessing Komga
KOMGA_PASSWORD2=          # Password for accessing Komga
KOMGA_API_KEY=            # API key for Komga (if applicable)
KOMGA_ORIGIN=             # The origin URL for Komga (e.g., https://komga-instance.com)
KOMGA_API_LOCATION=       # API endpoint for Komga
SESSION_SECRET=           # Secret key for session management
```

## Docker Setup

### Development

- **For local development**, use the `docker-compose.dev.yml` file to run the app in a container on `localhost:3001`.
  
  ```bash
  docker-compose -f docker-compose.dev.yml up
  ```

## Scripts

1. **Start the Server**
   
   ```bash
   npm start # Start the server.
   ```
2. **Commit with Commitizen**
   
   ```bash
   npm run commit # Uses Commitizen for structured commit messages.
   ```
3. **Release a New Version**
   
   ```bash
   npm run release # Uses standard-version for semantic versioning, Git tagging, and pushing to the main branch.
   ```
4. **Build and Release Docker Image**
   
   ```bash
   npm run docker:release # Builds and releases a Docker image.
   ```
# API Documentation

## Routes

### 1. `/slideshow/random-book`
**Method:** `GET`  
**Description:** Fetches a random Komga book image.

**Query Parameters:**
- `page` (optional): Specifies the page number for retrieving a random image. The default value is `0`.

**Response:**
- Returns an image with a `Content-Type` header appropriate for the image type.
- Returns a `500` error if no valid image is found.

### 2. `/crawl`
**Method:** `GET`  
**Description:** Initiates a crawl to retrieve Komga book data.

**Response:**
- Returns `JSON` data with the crawled content.
- Returns a `500` error if no content is found.

## Error Handling
Errors are managed using the `handleError` function from the `utils` module to provide consistent API error responses.

## License
This project is licensed under the **MIT License**.
