# Use a small official Node.js runtime image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Set runtime port
ENV PORT=3000
EXPOSE 3000

# Default command; update if your app entrypoint differs
CMD ["node", "server.js"]
