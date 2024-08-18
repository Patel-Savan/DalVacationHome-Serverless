# Use an official Node.js runtime as a parent image
FROM node:latest AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Use an official Nginx image to serve the built app
FROM nginx:alpine

# Copy the built app to the Nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
