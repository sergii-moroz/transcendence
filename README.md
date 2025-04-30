# transcendence

## 🚀 Getting Started
### 📦 Install dependencies

```bash
npm install
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
