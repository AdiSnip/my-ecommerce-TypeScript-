# My E-Commerce App

A full-stack e-commerce application built with robust modern technologies.

## 🚀 Tech Stack

### Client
-   **Core**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **Payments**: [Stripe](https://stripe.com/)

### Server
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: JWT, bcryptjs
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

```text
my-e-commerce-app/
├── client/         # React Frontend
└── server/         # Node.js/Express Backend
```

## 🛠️ Getting Started

### Prerequisites
-   Node.js installed
-   MongoDB instance (local or Atlas)

### 1. Setup Server
```bash
cd server
npm install
npm run dev
```
*Server runs on default port (check `server.ts` or `.env`)*

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```
*Client typically runs on `http://localhost:5173`*

## 📜 Scripts

| Service | Command         | Description                |
| :------ | :-------------- | :------------------------- |
| Client  | `npm run dev`   | Start dev server           |
| Client  | `npm run build` | Build for production       |
| Server  | `npm run dev`   | Start dev server (ts-node) |
| Server  | `npm run build` | Compile TypeScript         |

## 📝 License
This project is licensed under the ISC License.
