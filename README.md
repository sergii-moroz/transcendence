# transcendence

## 🚀 Getting Started
### 📦 Install dependencies

```bash
npm install
```

### ⚙️ Setup environment variables

Copy the sample file and set your secrets:
```bash
cd srcs/services/web/backend/
cp .env.sample .env
```
Edit `.env` and set the following variables to a secure, 32-character long random string:

```
JWT_ACCESS_SECRET=your_32_char_access_secret_here
JWT_REFRESH_SECRET=your_32_char_refresh_secret_here
```

### 🔧 Build the project
```bash
npm run build
```
This step compiles TypeScript to JavaScript in the `dist/` folder and copies static files.

### 🧪 Run in development mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server on code changes.



## ⚙️ Notes

- Project uses mixed file types (`*.ts` and `*.js`).
- TypeScript only compiles `*.ts` files. To ensure all assets are available in `dist/`, you must:

	- Run `npm run build`, or
	- Manually copy static files with: `cpx "src/public/**/*" dist/public`


## 📁 Folder Structure (simplified)
```
project/
│
├── dist/               # Compiled JS files (after build)
├── src/
│   ├── db/
│   │   ├── connection.ts   # DB connection (shared)
│   │   ├── init.ts         # DB initialization + migration runner
│   │   ├── migrations/
│   │   │   ├── 001-create-users.ts
│   │   │   ├── 002-create-posts.ts
│   │   │   └── ... more migration files
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── routes.ts       # Registers all route modules
│   ├── services/
│   │   ├── userService.ts  # Business logic for users
│   │   ├── authService.ts  # Business logic for auth
│   ├── app.ts
│   ├── index.ts
│   └── types/
│       └── user.ts
├── public/             # Static HTML, CSS, JS
├── types/              # Global types
├── package.json
├── tsconfig.json
└── .env
```
