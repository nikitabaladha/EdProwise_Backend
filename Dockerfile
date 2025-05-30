# 1. Use official Node.js image (with Alpine for smaller size if preferred)
FROM node:22

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app
COPY . .

COPY .env .env

# 6. Expose the port defined in .env
EXPOSE 3001

# 7. Start the app
CMD ["node", "app.js"]
