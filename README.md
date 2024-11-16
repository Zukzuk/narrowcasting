# Komga Narrowcasting App

A Node.js narrowcasting application designed to serve and manage Komga book images with a simple REST API and frontend interface. This app is Docker-ready and includes configurations for both development and production environments. 

## CQRS Pattern

This project follows the CQRS (Command Query Responsibility Segregation) pattern, which separates the responsibilities of commands (write operations) and queries (read operations).
Commands are handled by the CommandHandler and aggregates, while queries are handled by read models. Events are used to communicate the results of command execution. The Orchestrator class ties everything together, ensuring that commands and queries are processed correctly.

## Installation

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/zukzuk/narrowcasting.git
   ```
2. **Navigate to the project directory:**
   
   ```bash
   cd narrowcasting
   ```
3. **Install dependencies:**
   
   ```bash
   npm install
   ```

## Development

1. **Run the Application**
   
   ```bash
   npm run docker:dev # Run the docker dev container.
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

## Project Structure

### Folder Details

- **deploy/**: Production-specific configuration files
- **public/**: Frontend assets for displaying images and interacting with Komga data.
- **scripts/**: Scripts and Dockerfiles for CI/CD.
- **server/**: Backend code, Express API setup, routing, and utility modules.
- **.dev.env**: Environment variables for development.
- **docker-compose.dev.yml**: Configuration file for local development on `localhost:3001`.

### Server Directory ###
  - `application/`: Contains backend application logic.
    - `CommandHandler.js`, `Orchestrator.js`
  - `domain/`: Domain-specific logic.
    - `[DOMAIN]/`
      - `commands/`
      - `events/`
      - `services/`
      - `AggregateFactory.js`
  - `infrastructure/`: Infrastructure-related code.
    - `filesystem/`
    - `repositories/`
  - `interfaces/`: Interface definitions.
    - `api/`
    - `repositories/`
  - `index.js`: Server init and bootstrap.
  - `utils.js`: Utility functions for the server.
  - `config.js`: Configuration file for the server.

### Environment Variables

```plaintext
# .secrets/private.env
KOMGA_USERNAME2=          # Username for accessing Komga
KOMGA_PASSWORD2=          # Password for accessing Komga
KOMGA_API_KEY=            # API key for Komga (if applicable)
SESSION_SECRET=           # Secret key for session management

# deploy/public.env
KOMGA_ORIGIN=             # The origin URL for Komga
KOMGA_API_PATH=           # Path to Komga API
APP_API_PATH=             # Api path of the app itself
[APPNAME]]_API_PATH=      # Api path of a narowcasting target
API_DOCS_PATH=            # Api Docs path

# dev.env
# Any var needed, can overwrite all above
```

# API Documentation
[localhost]/api-docs

## License
This project is licensed under the **MIT License**.
