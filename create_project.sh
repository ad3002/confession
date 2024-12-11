#!/bin/bash

# Create main project directory
mkdir -p confession

# Create all directories
mkdir -p confession/backend/app/routes
mkdir -p confession/frontend/src/app/auth
mkdir -p confession/frontend/src/app/profile
mkdir -p confession/frontend/src/app/gallery
mkdir -p confession/frontend/src/components
mkdir -p confession/frontend/src/lib
mkdir -p confession/nginx

# Create backend files
touch confession/docker-compose.yml
touch confession/.env
touch confession/backend/Dockerfile
touch confession/backend/requirements.txt
touch confession/backend/app/main.py
touch confession/backend/app/models.py
touch confession/backend/app/config.py
touch confession/backend/app/routes/__init__.py
touch confession/backend/app/routes/auth.py
touch confession/backend/app/routes/users.py
touch confession/backend/app/routes/notes.py

# Create frontend files
touch confession/frontend/Dockerfile
touch confession/frontend/package.json
touch confession/frontend/tailwind.config.js
touch confession/frontend/postcss.config.js
touch confession/frontend/next.config.js
touch confession/frontend/src/app/layout.tsx
touch confession/frontend/src/app/page.tsx
touch confession/frontend/src/app/auth/page.tsx
touch confession/frontend/src/app/profile/page.tsx
touch confession/frontend/src/app/gallery/page.tsx
touch confession/frontend/src/components/AuthForm.tsx
touch confession/frontend/src/components/Profile.tsx
touch confession/frontend/src/components/Gallery.tsx
touch confession/frontend/src/components/Note.tsx
touch confession/frontend/src/lib/api.ts

# Create nginx files
touch confession/nginx/Dockerfile
touch confession/nginx/nginx.conf

# Make the script executable
chmod +x create_project.sh