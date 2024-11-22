# Media library narrowcasting applications

A Node.js narrowcasting application designed to serve your media library images with a simple REST API and frontend interface. This app is Docker-ready and includes configurations for both development and production environments.
Currently compatible with the following API's
- Komga
- Plex

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
3. **Push a new version**
   
   ```bash
   npm run push # Does semantic versioning, pushes to git origin and creates a new development container.
   ```
4. **Build and release Docker Image**
   
   ```bash
   npm run release
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
APP_SESSION_SECRET=                 # Secret key for session management
KOMGA_USERNAME=                     # Komga username
KOMGA_PASSWORD=                     # Komga password
KOMGA_API_KEY=                      # Komga API key (if applicable)
PLEX_API_KEY=                       # Plex API key

# deploy/public.env
APP_STATIC_SERVE_PATH=              # Path to client's static files
APP_API_PATH=                       # Api path of the app itself
APP_API_DOCS_PATH=                  # Api Docs path
[APPNAME]_ORIGIN=                   # The origin URL for the target app
[APPNAME]_API_PATH=                 # Path to the target API
[APPNAME]_NARROWCASTING_API_PATH=   # Api path of a narrowcasting target

# dev.env
# Add any var here, overwrites all above
```

# API Documentation
http://localhost:3001/api-docs

## License
This project is licensed under the **MIT License**.
