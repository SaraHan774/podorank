FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all packages
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Install dependencies
RUN npm ci

# Build shared first, then backend
RUN npm run build -w packages/shared
RUN npm run build -w packages/backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
