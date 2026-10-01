![Resolve](frontend/public/preview.png)

# Resolve

A multi-tenant bug tracker. People work together in **teams**; each team has its
own **issues**, with comments, emoji reactions and a private AI assistant
(Google Gemini) on every issue. Teams are strictly isolated from each other.

## Features

- **Accounts:** sign up, log in and out, edit your name and email, change your
  password (which signs out your other devices).
- **Teams:** create a team, add members by email, promote or demote them
  between *Team Admin* and *Contributor*, rename, leave or delete a team.
- **Issues:** title, Markdown description, priority (low / high / critical),
  status (open / closed), assignee and a per-team number (#1, #2, …). The list
  can be searched and filtered by status, priority and creator.
- **Comments:** a chat-style thread per issue with emoji reactions (one per
  person per comment). Closed issues don't take new comments.
- **AI chat:** each user has a private conversation with Gemini about each
  issue, with one-click *Summarize* and *Analyze* prompts.
- **Dashboard:** counts of your teams, open issues, critical/high issues and
  issues assigned to you, plus recent activity.
- **Admin panel** for system admins: manage users and teams, and read the
  **audit log**, which records every deletion in the system.

## Tech stack

| Part | Tools |
|------|-------|
| Backend | Rust (edition 2024), Actix-web 4, MongoDB (official driver), bcrypt, reqwest |
| Frontend | React 19 (plain JSX), Vite, TanStack Query, React Router, Tailwind CSS 4, Radix UI (dialogs and menus), lucide icons, react-markdown |
| AI | Google Gemini (`gemini-3.5-flash`) |

## Getting started

You need **Rust 1.88+**, **Node 20.19+ or 22.12+** and a **MongoDB** database
(local or Atlas).

**1. Backend**

```sh
cd backend
cp .env.example .env    # then fill in MONGO_URI (and GEMINI_API_KEY for the AI chat)
cargo run               # API at http://localhost:8080/api
```

Indexes are created automatically on startup.

**2. Frontend**

```sh
cd frontend
cp .env.example .env
npm install
npm run dev             # app at http://localhost:5173
```

**3. Make yourself a system admin (optional).** There is no sign-up for
admins. Register normally, then set `is_admin: true` on your user in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { is_admin: true } })
```

After that, other admins can be promoted from the admin panel.

## Configuration

**Backend** (`backend/.env`, read by `src/config.rs`):

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGO_URI` | yes | – | MongoDB connection string |
| `MONGO_DB` | no | `resolve` | Database name |
| `GEMINI_API_KEY` | no | – | Enables the AI chat. Without it the app works, and the chat says it's unavailable. |
| `COOKIE_SECURE` | no | `true` | Set to `false` for local development over plain http |
| `FRONTEND_ORIGIN` | no | `http://localhost:5173` | The only site allowed to call the API from a browser (CORS) |
| `PORT` | no | `8080` | Port the server listens on |

**Frontend** (`frontend/.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:8080/api` | Where the backend API lives |

**In production:** serve both over https, set `COOKIE_SECURE=true`, set
`FRONTEND_ORIGIN` to the frontend's exact URL, and build the frontend with
`VITE_API_URL` pointing at the backend. The session cookie is `SameSite=None;
Secure` in that mode, so the frontend and backend can live on different domains.

## Roles and permissions

| Who | Can |
|-----|-----|
| **Any team member** | See the team's issues and members, create issues, comment, react, use their own AI chat, leave the team |
| **Issue creator / assignee** | Edit the issue (priority, status, assignee, text). The creator can also delete it. |
| **Comment author** | Delete their comment |
| **Team Admin** | Everything above on every issue and comment in the team, plus: rename or delete the team, add and remove members, change roles. A team always keeps at least one admin. |
| **System Admin** | Use the admin panel: list, promote, demote and delete users; list and delete teams; read the audit log. A system admin does **not** get access to issues in teams they aren't a member of. |

The backend enforces all of these rules; the frontend only hides buttons you
can't use.

## How it works

**Sessions.** Logging in creates a random session token. The browser keeps it
in an httpOnly cookie, and the database stores only its SHA-256 hash, which
MongoDB deletes automatically after 30 days.

**Team isolation.** Every team route starts with `/teams/{team_id}`. Handlers
there take a `Member` argument (`team/extractor.rs`), which checks that the
signed-in user belongs to that team and answers **404** if not, so outsiders
can't even tell the team exists. Issues, comments and chats are only reached
through `member.scoped::<T>()` (`db/scoped.rs`), which adds `team_id` to every
database query. A handler can't read or change another team's data by mistake.

**Dashboard.** There is no dashboard endpoint. `GET /teams` returns each team
with its issue counts, and the dashboard adds them up.

**Audit log.** Every deletion (users, teams, members, issues, comments,
reactions, AI chats) is written to `audit_logs` with who did it and what was
deleted, and is shown in the admin panel.

**AI.** The AI only reads: it gets the issue's text and the user's recent chat
messages, and never changes anything in the database.

## API

All routes are under `/api`. Request and response bodies are JSON; errors look
like `{"error": "message"}`.

| Method | Path | Who | What |
|--------|------|-----|------|
| POST | `/auth/register` | anyone | Create an account and sign in |
| POST | `/auth/login` | anyone | Sign in |
| POST | `/auth/logout` | anyone | Sign out this browser |
| GET | `/auth/me` | anyone | The signed-in user, or `null` |
| PATCH | `/me` | signed in | Update name / email (email change needs the current password) |
| PUT | `/me/password` | signed in | Change password |
| GET, POST | `/teams` | signed in | Your teams (with dashboard counts) / create a team |
| PATCH, DELETE | `/teams/{team_id}` | team admin | Rename / delete the team |
| GET, POST | `/teams/{team_id}/members` | member / team admin | List members / add a member by email |
| GET | `/teams/{team_id}/users/lookup?email=` | team admin | Find an account by exact email |
| PATCH, DELETE | `/teams/{team_id}/members/{user_id}` | team admin (or yourself, to leave) | Change role / remove member |
| GET, POST | `/teams/{team_id}/issues` | member | List / create issues |
| GET, PUT, DELETE | `/teams/{team_id}/issues/{issue_id}` | see permissions | Get / edit / delete an issue |
| GET, POST | `…/issues/{issue_id}/comments` | member | List / add comments |
| DELETE | `…/comments/{comment_id}` | author or team admin | Delete a comment |
| PUT, DELETE | `…/comments/{comment_id}/reaction` | member | Set / remove your reaction |
| GET, POST, DELETE | `…/issues/{issue_id}/chat` | member | Your AI chat: history / send a message / start over |
| GET | `/admin/users` | system admin | All users |
| PATCH, DELETE | `/admin/users/{user_id}` | system admin | Set `is_admin` / delete a user |
| GET | `/admin/teams` | system admin | All teams |
| DELETE | `/admin/teams/{team_id}` | system admin | Delete a team |
| GET | `/admin/audit-logs` | system admin | The 500 most recent deletions |

## Project layout

```
backend/src/
  main.rs           server setup: CORS, routes, shared state
  config.rs         environment settings
  error.rs          AppError: every error becomes {"error": "..."}
  validation.rs     input checks (text length, email)
  db/               Model trait, the team-scoped collection wrapper, indexes
  <feature>/        auth, user, team, issue, comment, chat, admin
    handler.rs      the endpoint functions
    model.rs        data stored in MongoDB and request bodies
    routes.rs       which URL goes to which handler
    …               helpers some features need (extractor.rs, session.rs, gemini.rs, audit.rs)

frontend/src/
  App.jsx           routes; signed-out visitors are sent to /login
  api.js            the one fetch helper every request goes through
  hooks/            useGet, useSend, useMe, useTeam, useMembers, useForm, …
  components/ui/    shared building blocks: Button, Modal, Menu, Table, …
  components/sidebar/  the app's side navigation
  features/<feature>/  one folder per page area, one component per file
  utils/            date formatting and labels
```
