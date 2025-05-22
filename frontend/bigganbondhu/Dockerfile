FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Second stage: use a smaller image for production
FROM nginx:alpine

# Copy built files from the builder stage to nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port for the frontend
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]