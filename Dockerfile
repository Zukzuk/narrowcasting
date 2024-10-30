# Use a Debian-based Node.js image
FROM node:20-bullseye

# Install OpenJPEG tools and libvips for sharp
RUN apt-get update && \
    apt-get install -y libopenjp2-tools libvips && \
    rm -rf /var/lib/apt/lists/*

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
