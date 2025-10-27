# Use official Nginx image
FROM nginx:latest

# --- NGINX SETUP ---

# Copy the *contents* of the local 'dist' directory into Nginx's web root.
# This ensures your index.html is served at the root URL (/)
COPY dist/ /usr/share/nginx/html/

# Copy the custom nginx config to serve all paths to index.html (SPA Fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- CLEANUP / SCRIPTS (Removed install.sh for brevity unless needed) ---

# We don't need to copy install.sh if it's not a part of the static site,
# or if it's just for building the image (which should use RUN).

# If install.sh is needed for the site, use this (adjust path if needed):
# COPY install.sh /usr/share/nginx/html/install.sh

# --- FINAL CONFIG ---

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
