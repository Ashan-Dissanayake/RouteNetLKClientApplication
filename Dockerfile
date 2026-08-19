# ==========================================
# Stage 1: Build Angular Frontend
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Build production bundle
COPY . .
RUN npm run build -- --configuration production

# ==========================================
# Stage 2: Lightweight Nginx Alpine Runtime
# ==========================================
FROM nginx:alpine-slim AS runtime

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Angular assets
COPY --from=builder /app/dist/routenet-lk/browser /usr/share/nginx/html

# Permissions & non-root user security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
