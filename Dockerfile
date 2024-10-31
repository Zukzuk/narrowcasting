# Use a Debian-based Node.js image
FROM node:20-alpine

# Accept VERSION as a build argument
ARG VERSION_TAG
ENV VERSION_TAG=$VERSION_TAG

# Set up the working directory and install dependencies
WORKDIR /usr/src/app
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
