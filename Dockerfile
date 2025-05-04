# Use Node.js LTS as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install yarn
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare yarn@stable --activate

# Copy package files
COPY package.json ./

# Only copy yarn.lock if it exists
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 8001

# Use dev command for development
CMD ["yarn", "dev", "--host", "0.0.0.0"]