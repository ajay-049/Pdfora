# Stage 1: build the React/Vite app using Node.js.
# This image contains Node and npm, which are needed to install packages
# and run the production build command.
FROM node:20-alpine AS builder

# Everything from the next commands will happen inside /app in the container.
# This keeps the filesystem layout predictable.
WORKDIR /app

# Copy only package files first.
# This is important for Docker layer caching:
# if dependencies do not change, Docker can reuse the npm install layer.
COPY package*.json ./

# Install dependencies exactly as locked in package-lock.json.
# npm ci is preferred in CI/CD and Docker because it is clean and reproducible.
RUN npm ci

# Copy the rest of the project into the build container.
# Now Docker has the source code, public assets, and config files.
COPY . .

# Build the Vite app for production.
# This creates static files inside /app/dist.
RUN npm run build

# Stage 2: serve the built files with Nginx.
# This final image is smaller than a Node image and is better suited
# for serving static frontend files in production.
FROM nginx:1.27-alpine

# Replace the default Nginx site config with one tailored for a single-page app.
# This lets React Router routes work when a user refreshes the page directly.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy only the production build output from the builder stage.
# The source code and Node modules do not go into the final runtime image.
COPY --from=builder /app/dist /usr/share/nginx/html

# Document that the container serves traffic on port 80.
EXPOSE 80

# Start Nginx in the foreground so the container keeps running.
CMD ["nginx", "-g", "daemon off;"]
