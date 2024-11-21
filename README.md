# Komga Narrowcasting App

A Node.js narrowcasting application designed to serve your media library images with a simple REST API and frontend interface. This app is Docker-ready and includes configurations for both development and production environments. 

## CQRS Pattern

This project follows the CQRS (Command Query Responsibility Segregation) pattern, which separates the responsibilities of commands ('do' operations) and queries ('read' operations).
Commands are handled by the CommandBus, CommandHandler and aggregates, while queries are handled by readModels. Events are used to communicate the results of command execution.

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

1. **Run the dev application**
   
   ```bash
   npm run docker:dev
   ```
2. **Commit with commitizen**
   
   ```bash
   npm run commit
   ```
3. **Release a new version**
   
   ```bash
   npm run release # Uses standard-version for semantic versioning, Git tagging, and pushing to the main branch.
   ```
4. **Build and release Docker Image**
   
   ```bash
   npm run docker:release
   ```

## Project Structure

### Folder Details

- **deploy/**: Production-specific variables and compose files.
- **scripts/**: Scripts and Dockerfiles for CI/CD.
- **src/**: Application source code.
- **.dev.env**: Environment variables for development.
- **docker-compose.dev.yml**: Development compose file.

### Server Directory ###
  - `application/`: Contains backend application logic.
  - `domain/`: Domain-specific logic.
    - `[DOMAIN]/`
      - `commands/`
      - `events/`
      - `services/`
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
http://localhost:3001/api-docs

## License
This project is licensed under the **MIT License**.
