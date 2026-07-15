# Reflect: Postman API Testing Guide

This guide describes how to start the backend server and test all endpoints using Postman.

---

## 1. Prerequisites & Startup

### Step A: Start MongoDB
Make sure MongoDB is running on your computer. If you have MongoDB installed locally as a service, it should start automatically. If you need to start it manually, run:
```bash
mongod
```

### Step B: Run the Backend Server
Navigate to the `backend/` directory and start the server:
```bash
cd backend
npm run dev
```
You should see:
```text
MongoDB Connected: 127.0.0.1
Seeded default admin user: admin@reflect.com
Seeded default regular user: user@reflect.com
Server running on port 5000
```

---

## 2. Seeded Accounts for Testing

The application automatically seeds these two accounts on startup:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Regular User** | `user@reflect.com` | `userpassword` | `user` |
| **Admin User** | `admin@reflect.com` | `adminpassword` | `admin` |

---

## 3. Postman Authorization (Token Setup)

Most endpoints require a JSON Web Token (JWT).
1. Send a request to the **Login** endpoint (see below).
2. Copy the value of the `token` string returned in the JSON response.
3. In Postman, under the **Authorization** tab of any protected request:
   - Select **Type**: `Bearer Token`
   - Paste the copied token into the **Token** field.
   
*(Alternatively, you can add a header manually: `Authorization` with value `Bearer YOUR_TOKEN_HERE`)*

---

## 4. API Endpoints

### Category A: Authentication & User Profile

#### 1. Welcome / Health Check
* **Method**: `GET`
* **URL**: `http://localhost:5000/`
* **Auth**: None

#### 2. User Login
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Body**: (JSON)
  ```json
  {
    "email": "user@reflect.com",
    "password": "userpassword"
  }
  ```

#### 3. User Register
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/register`
* **Body**: (JSON)
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@reflect.com",
    "password": "password123"
  }
  ```

#### 4. View Profile
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/auth/profile`
* **Auth**: Bearer Token

---

### Category B: Diary Module (with Media Uploads)

#### 1. Create Diary Entry (with Audio / Video Uploads)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/diary`
* **Auth**: Bearer Token
* **Body**: (select `form-data` in Postman)
  * Set key-value pairs as follows:
    * `title` (Text): `My Awesome Day`
    * `content` (Text): `Today I did some coding and recorded a video log!`
    * `date` (Text): `2026-07-15` (format: YYYY-MM-DD)
    * `tags` (Text): `coding,journal,multimedia`
    * `audio` (File): *Hover over the key field, click the dropdown to change from Text to **File**, and select an audio file (e.g. `.mp3` or `.wav`)*
    * `video` (File): *Change key type to **File** and select a video file (e.g. `.mp4` or `.webm`)*

#### 2. Get All User Diary Entries (List, Search & Filter)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/diary`
* **Auth**: Bearer Token
* **Optional Query Parameters** (Enter in Postman's **Params** tab):
  * Filter by text search: Set `search` = `coding`
  * Filter by specific date: Set `date` = `2026-07-15`
  * Filter by calendar month: Set `month` = `2026-07` (helps retrieve entries for highlight dots)

#### 3. Get Single Entry
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/diary/INSERT_DIARY_ID_HERE`
* **Auth**: Bearer Token

#### 4. Update Diary Entry
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/diary/INSERT_DIARY_ID_HERE`
* **Auth**: Bearer Token
* **Body**: (`form-data`)
  * Modify title, content, or upload a new `audio` or `video` file.

#### 5. Delete Diary Entry
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/diary/INSERT_DIARY_ID_HERE`
* **Auth**: Bearer Token

---

### Category C: To-Do List Module

#### 1. Get All Tasks
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/todo`
* **Auth**: Bearer Token

#### 2. Create Task
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/todo`
* **Auth**: Bearer Token
* **Body**: (JSON)
  ```json
  {
    "title": "Complete postman testing and screenshots",
    "dueDate": "2026-07-16"
  }
  ```

#### 3. Update Task (Toggle Status / Change Title)
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/todo/INSERT_TASK_ID_HERE`
* **Auth**: Bearer Token
* **Body**: (JSON)
  ```json
  {
    "status": "completed"
  }
  ```

#### 4. Delete Task
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/todo/INSERT_TASK_ID_HERE`
* **Auth**: Bearer Token

---

### Category D: Notifications

#### 1. Get User Notifications
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/notifications`
* **Auth**: Bearer Token

#### 2. Mark Notification as Read
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/notifications/INSERT_NOTIFICATION_ID_HERE/read`
* **Auth**: Bearer Token

---

### Category E: Admin Module (Use `admin@reflect.com` login token)

#### 1. Admin Dashboard Overview Stats
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/admin/dashboard`
* **Auth**: Admin Bearer Token

#### 2. Get All Users
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/admin/users`
* **Auth**: Admin Bearer Token

#### 3. View All Diary Activities (All users)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/admin/activities`
* **Auth**: Admin Bearer Token

#### 4. Send Notification (Global broadcast or user targeted)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/admin/notifications`
* **Auth**: Admin Bearer Token
* **Body**: (JSON)
  ```json
  {
    "message": "Welcome to Reflect! Let us know if you experience any bugs.",
    "isGlobal": true
  }
  ```
