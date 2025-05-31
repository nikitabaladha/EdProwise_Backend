# 1. Use official Node.js image (with Alpine for smaller size if preferred)
FROM node:22

# Install required system dependencies for Puppeteer
RUN apt-get update && \
    apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    chromium \
    && rm -rf /var/lib/apt/lists/*

RUN which chromium || which chromium-browser || echo "Chromium not found"
RUN chromium --version || chromium-browser --version || echo "Chromium not installed"

# 2. Set working directory
WORKDIR /app

RUN mkdir -p /app/temp

# 3. Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app
COPY . .

# COPY .env .env

# 6. Expose the port defined in .env
EXPOSE 3001

# 7. Start the app
CMD ["node", "app.js"]
