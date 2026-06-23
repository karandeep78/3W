# 3W Mini Social Post Application

A full-stack social feed assignment inspired by TaskPlanet's Social page. Users can sign up, log in, create text/image posts, like posts, and comment on posts.

## Tech Stack

- Frontend: React.js + Vite + Basic CSS
- Backend: Node.js + Express
- Database: MongoDB / MongoDB Atlas
- Collections: `users`, `posts`

## Project Structure

```text
backend/      Express API, MongoDB models, auth, post routes
frontend/     React app and responsive TaskPlanet-inspired UI
netlify.toml  Netlify build config for the frontend
render.yaml   Render blueprint for the backend
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your MongoDB connection string and JWT secret.

3. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

For local development, keep:

```text
VITE_API_URL=http://localhost:8000/api
```

4. Start both apps:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000` and backend runs at `http://localhost:8000`.

Open the frontend URL in your browser. The backend URL is only for API responses.

## Deployment Structure

This repo is ready to deploy as two separate services:

- Frontend: Netlify, using `frontend/` as the app directory.
- Backend: Render, using `backend/` as the service root.

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new **Blueprint** from the repository if you want to use `render.yaml`, or create a new **Web Service** manually.
3. If creating the service manually, use:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

4. Add these Render environment variables:

```text
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=a long random secret
CLIENT_URL=your deployed Netlify frontend URL, for example https://your-app.netlify.app
```

Do not set `PORT` on Render. Render provides it automatically, and the backend already reads `process.env.PORT`.

After Render deploys, the API root should respond at:

```text
https://your-render-service.onrender.com/
```

The frontend API URL should include `/api`:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
```

### Frontend on Netlify

1. Push this repository to GitHub.
2. In Netlify, create a new site from the GitHub repository.
3. Netlify can read the root `netlify.toml`, which sets:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

4. Add this Netlify environment variable:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
```

5. After Netlify deploys, copy the Netlify site URL and set it as `CLIENT_URL` in Render, then redeploy the backend.

## Features

- Signup and login with email/password
- JWT authentication
- Public feed with all users' posts
- Create post with text, image, or both
- Like/unlike posts
- Add comments
- Shows usernames for likes and comments
- Pagination-friendly feed API
- Responsive mobile-first UI
