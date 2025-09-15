# Online Code Editor & Sharing Platform

## Overview

This project is a full-stack web application that allows users to write, preview, and share HTML, CSS, and JavaScript code snippets. Users can register, log in, manage their profile, and share code with other registered users. The backend is built with Node.js, Express, and MongoDB, while the frontend uses React and CodeMirror for the editor interface.

## Features

- **User Authentication:** Register and log in with username, email, and password (passwords are hashed).
- **Code Editor:** Write HTML, CSS, and JS with live preview and console output using CodeMirror.
- **Code Sharing:** Share code snippets with other users by email. Shared and received codes are tracked.
- **Profile Management:** View and edit profile, see shared and received code history, and delete code snippets.
- **Modern UI:** Responsive and user-friendly interface with styled components.

## Project Structure

```
backend/
  server.js           # Express server and API routes
  models/             # Mongoose models (User, SharedCode, ReceivedCode)
public/
  index.html          # Main HTML template
src/
  App.js              # Main code editor and sharing logic
  login.js            # Login form
  register.js         # Registration form
  Profile.js          # User profile and code history
  SnippetDetail.js    # View shared code snippet details
  App.css             # App styles
```

## How It Works

1. **User Registration & Login:**
   - Users register with a username, email, and password. Login verifies credentials and stores session info in localStorage.
2. **Code Editing:**
   - Users can write HTML, CSS, and JS in the editor. Live preview and console output are available.
3. **Code Sharing:**
   - Users can share code with other registered users by entering their email. Shared code is saved in the database and visible in both sender and receiver profiles.
4. **Profile Management:**
   - Users can view and edit their profile, see lists of shared and received code, and delete code snippets.
5. **Backend API:**
   - Express routes handle registration, login, sharing, and code retrieval. MongoDB stores users and code snippets.

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB

### Installation

#### Backend
```sh
cd backend
npm install
npm start
```

#### Frontend
```sh
npm install
npm start
```

### Usage
- Visit `http://localhost:3000` to use the app.
- Register or log in.
- Write code, preview, and share with others.

## Technologies Used
- **Frontend:** React, CodeMirror, JSZip, FileSaver
- **Backend:** Node.js, Express, MongoDB, Mongoose, bcryptjs
- **Styling:** CSS

---

Feel free to contribute or customize this project for your needs!
