# Use the official Node.js image as the base image
FROM node:18 as base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY . .
COPY lib /app/lib

# Install dependencies
RUN npm install && npm install /app/lib
RUN npm install bcrypt

# Copy the rest of the application code to the working directory

# RUN ls -la /app/node_modules/netlocklib

# Generate a self-signed certificate with a random passphrase
RUN apt-get update && apt-get install -y openssl && \
    export PASSPHRASE=$(openssl rand -base64 32) && \
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost" -passout env:PASSPHRASE


# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 443

# Start the application
CMD ["npm", "start", "--", "--passphrase=$PASSPHRASE"]
