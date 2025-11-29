# --- Stage 1: Build the React App ---
    FROM node:20-alpine as build

    WORKDIR /app

    
    
    COPY package*.json ./

    # ⬇️ ADDED: Fix for "ETIMEDOUT" errors ⬇️
# This makes npm wait longer before failing due to slow internet
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
    RUN npm install
    
    COPY . .
    
    # Build the app for production (creates dist/ folder)
    RUN npm run build
    
    # --- Stage 2: Serve with Nginx ---
    FROM nginx:alpine
    
    # Copy the built files from the previous stage to Nginx
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Remove default Nginx config and copy our custom one
    # (We will create this nginx.conf in the next step)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]

    