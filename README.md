# ChatChat

A real-time chat application built with a **Laravel 13** backend (REST API + Reverb WebSockets) and a **Next.js** frontend. Supports direct messages, group chats, GIFs, emoji, and live delivery via WebSockets.

---

## 📁 Project Structure

chatsample/
├── backend/ # Laravel API + Reverb WebSocket server
└── frontend/ # Next.js client

---

## ✅ Prerequisites

Make sure the following are installed on your machine:

| Tool     | Version | Notes                                                                       |
| -------- | ------- | --------------------------------------------------------------------------- |
| PHP      | 8.3+    | With `pdo_sqlite` or `pdo_mysql`, `openssl`, `mbstring`, `curl`, `fileinfo` |
| Composer | 2.x     | https://getcomposer.org                                                     |
| Node.js  | 20+     | https://nodejs.org                                                          |
| npm      | 10+     | Comes with Node                                                             |
| Git      | any     | https://git-scm.com                                                         |

**Laragon users:** most of this is already bundled. Just make sure the PHP version Laragon is using is 8.3+.

> ⚠️ **Windows note:** The Laravel Pail log viewer requires the `pcntl` PHP extension, which does **not** exist on Windows. We've removed it from the dev script (see [Run everything](#-run-everything)). If you see `The [pcntl] extension is required to run Pail.`, that's why.

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url> chatsample
cd chatsample
```

cd backend

# Install PHP dependencies

composer install

# Create the environment file

copy .env.example .env # Windows

# cp .env.example .env # macOS / Linux

# Generate the app encryption key

php artisan key:generate

# Set up the database (SQLite is simplest for local dev)

# Laravel creates database/database.sqlite automatically on migrate if it doesn't exist

php artisan migrate

# (optional) Seed demo users and groups

php artisan db:seed

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chatsample
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST="127.0.0.1"
REVERB_PORT=8080
REVERB_SCHEME=http

cd frontend

# Install Node dependencies

npm install

# Copy the example env file

copy .env.example .env.local # Windows

# cp .env.example .env.local # macOS / Linux

cd backend
composer dev

[server] INFO Server running on [http://127.0.0.1:8000].
[queue] INFO Processing jobs from the [default] queue.
[reverb] INFO Starting server on 0.0.0.0:8080 (localhost).

cd frontend
npm run dev

cd backend
tail -f storage/logs/laravel.log # macOS / Linux / Git Bash

# Get-Content storage\logs\laravel.log -Wait -Tail 20 # PowerShell

The [pcntl] extension is required to run Pail.

🛠 Troubleshooting
Pail error on Windows

The [pcntl] extension is required to run Pail.

Before:

"dev": [
"Composer\\Config::disableProcessTimeout",
"npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"npm run dev\" \"php artisan reverb:start\" --names=server,queue,logs,vite --kill-others"
]

"dev": [
"Composer\\Config::disableProcessTimeout",
"npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185\" \"php artisan serve\" \"php artisan queue:listen --tries=1 --timeout=0\" \"npm run dev\" \"php artisan reverb:start\" --names=server,queue,vite,reverb --kill-others"
]

Then run composer dev again.
