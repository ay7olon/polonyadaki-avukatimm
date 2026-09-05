# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* variables are public (non-secret) values that get baked into the
# client bundle at build time. Pass them at image build time, e.g.:
#   docker build \
#     --build-arg VITE_SUPABASE_URL=https://xxxx.supabase.co \
#     --build-arg VITE_SUPABASE_ANON_KEY=xxxx \
#     -t polonyadaki-avukatim .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run routes traffic to whatever port the container listens on; 8080
# is the conventional default and matches nginx.conf below.
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
