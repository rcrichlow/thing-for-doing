FROM oven/bun:1.3.11-alpine

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--host"]
