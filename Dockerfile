# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Install compilers/interpreters for supported languages
RUN apt-get update && apt-get install -y gcc g++ default-jdk python3

# Copy the rest of the application code to the container
COPY . .

# Expose the port that your Express app will listen on
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
