# --- Stage 1: Build the React App ---
    FROM node:20-alpine as build

    WORKDIR /app
    
    COPY package*.json ./
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