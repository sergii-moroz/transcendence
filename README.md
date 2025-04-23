# transcendence

## How to start
Install dependencies && start server
```bash
npm i
node server.js
```

## Features
- Pages: register, login, home, Profile, about page
- if DB not exist is would created at first start
- basic JWT (JavaWebToken) authentication
- access token expires after 15 min
- CSRF protection

## Known issues

- try to refresh access token but finished with "Failed to refresh token"
