# Narrowcasting for all your media libraries

A Node.js narrowcasting application designed to serve your media library images with a simple REST API and frontend interface. This app is Docker-ready and includes configurations for both development and production environments.
Currently adapted the following API's
- [Komga](https://komga.org/)
- [Plex](https://www.plex.tv/)
- [Playnite](https://playnite.link/)

## Installation

1. **Clone the repository:**
   
   ```bash
   git clone https://github.com/zukzuk/narrowcasting.git
   ```
2. **Navigate to the project directory:**
   
   ```bash
   cd narrowcasting
   ```

## Development

1. **Run the dev application**
   
   ```bash
   npm run dev # Does npm install, compiles ts, creates a docker dev image and runs as container
   ```
2. **Commit with commitizen**
   
   ```bash
   git add .
   npm run commit # Runs commitizen
   ```
3. **Push a new version**
   
   ```bash
   npm run push # Does semantic versioning, pushes to git origin and creates a new dev image.
   ```
4. **Build and release Docker Image**
   
   ```bash
   npm run release # Pushes release docker inages with semver and 'latest' tag
   ```
## Running locally
http://localhost:3001/

Several querystring filters are added for tailoring the experience:
```plaintext
http://localhost:3001/?interval=12&showVersion=true

interval=12 
   interval of requested images in seconds 
   default = 10, 
   minimum = 3 (enforced by server)

showVersion=true 
   show a version label in the bottom right
   default = false
```

## Documentation
http://localhost:3001/docs

http://localhost:3001/api-docs

# Project Structure

## CQRS Pattern

This project implements ```CQRS``` (Command Query Responsibility Segregation), separating ```Commands``` (write operations) and ```Queries``` (read operations). Clients send GET (Queries) or POST (Commands) requests to the ```Backend For Frontend``` ```(BFF)```, which translates them into appropriate actions. The server can also generate internal ```Commands```.

```Commands``` are processed by ```CommandHandlers``` and ```Aggregates```.
```Queries``` are resolved using ```ReadModels```, updated through ```DomainEvents``` emitted after ```Command``` processing.
```DomainEvents``` capture business state changes and ensure ```ReadModels``` stay consistent. ```Commands``` and ```DomainEvents``` enforce ```Domain Logic``` and are not a CRUD substitute.

A ```Broker``` decouples the ```BFF``` and the domain components, ensuring flexibility and scalability.

## Structure

- **deploy/**: Production-specific variables and compose files.
- **dist/**: Automatically created on build for runtime files.
- **scripts/**: Scripts and Dockerfiles for CI/CD.
- **src/**: Application source code.
   - **public/**: Frontend source code.
   - **server/**: Server source code.
- **.dev.env**: Environment variables for development.
- **docker-compose.dev.yml**: Development compose file.

### Server structure
  - `application/`: Backend application logic.
  - `domain/`: Domain-specific logic.
    - `[ADAPTERS]/`
      - `services/`
    - `[DOMAINS]/`
      - `services/`
    - `core/`
      - `annotations/`
      - `commands/`
      - `events/`
      - `types/`
    - `shared/`
      - `services/`
  - `infrastructure/`: Infrastructure-related code.
    - `broker/`
    - `repositories/`
  - `interfaces/`: Interface definitions.
    - `apis/`
    - `readmodels/`
  - `config.js`: Configuration file for the server.
  - `helpers.js`: Helper functions for the code-base.
  - `index.js`: Server init and bootstrap.
  - `swagger.js`: Swagger implementation.
  - `utils.js`: Utility functions for the server.

### Client structure
TBD

### Environment Variables

```plaintext
# .secrets/private.env
APP_SESSION_SECRET=                 # Secret key for session management
KOMGA_USERNAME=                     # Komga username
KOMGA_PASSWORD=                     # Komga password
KOMGA_API_KEY=                      # Komga API key (if applicable)
PLEX_API_KEY=                       # Plex API key
PLEX_MACHINE_DENTIFIER=             # Plex Server ID

# deploy/public.env
APP_SHOW_LOGGING=                   # Wether or not to show server logging
APP_STATIC_SERVE_PATH=              # Path to client's static files
APP_API_PATH=                       # Api path of the app itself
APP_API_DOCS_PATH=                  # Api Docs path
[TARGET]_ORIGIN=                    # URL or path to the origin of a target app
[TARGET]_API_PATH=                  # Path to a target app's API
[TARGET]_BACKUP_ORIGIN=             # Path to a backup file of a target app

# dev.env
# Add any var here, overwrites all above
```

# License
This project is licensed under the **MIT License**.
