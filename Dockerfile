FROM node:18-alpine AS build

WORKDIR /app

# Build-time environment for Vite
ARG VITE_API_URL=/api
ARG VITE_PAYMENT_API_URL=/payment-api
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PAYMENT_API_URL=${VITE_PAYMENT_API_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config to serve SPA and proxy /api to backend on host
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
