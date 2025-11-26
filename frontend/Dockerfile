# Development stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:3000}

# Expose Vite dev server port
EXPOSE 5173

# Health check for Vite dev server
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173 || exit 1

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
