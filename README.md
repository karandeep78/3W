# 3W Mini Social Post Application

A full-stack social feed assignment inspired by TaskPlanet's Social page. Users can sign up, log in, create text/image posts, like posts, and comment on posts.

## Tech Stack

- Frontend: React.js + Vite + Basic CSS
- Backend: Node.js + Express
- Database: MongoDB / MongoDB Atlas
- Collections: `users`, `posts`

## Project Structure

```text
backend/   Express API, MongoDB models, auth, post routes
frontend/  React app and responsive TaskPlanet-inspired UI
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

3. Start both apps:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000` and backend runs at `http://localhost:8000`.

Open the frontend URL in your browser. The backend URL is only for API responses.

## Deployment

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from the GitHub repository.
3. Use these settings if you create the service manually:

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
CLIENT_URL=your deployed frontend URL, for example https://your-app.vercel.app
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

### Frontend

- Deploy `frontend/` to Vercel or Netlify.
- Set `VITE_API_URL` in the frontend deployment to the Render backend API URL.

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
