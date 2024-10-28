# Dockerfile

# Use a minimal Node.js image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy the rest of the application files
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
