# Use a light version of Node.js
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock file first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server code
COPY . .

# Expose the port defined in your server.js
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./

# ✅ ADDED: Increase network timeout settings
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000

RUN npm install
COPY . .
CMD ["node", "index.js"]