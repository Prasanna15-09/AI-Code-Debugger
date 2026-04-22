# AI Code Debugger

Minimal full-stack MVP — React frontend + Node/Express backend + Groq API.

## Project Structure

```
ai-code-debugger/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
GROQ_API_KEY=...
 node server.js
```

Runs on http://localhost:3001

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Runs on http://localhost:3000 — proxies `/debug` to the backend automatically.

## Usage

1. Paste code into the textarea
2. Select language from dropdown
3. Click **Debug** or press `Cmd+Enter`
4. See bug type, line, issue, fix, and explanation

## API

**POST** `/debug`

Request:
```json
{ "code": "int main() { int a = 10\n cout << a; }", "language": "C++" }
```

Response:
```json
{
  "bug_type": "syntax",
  "line": 2,
  "issue": "missing semicolon",
  "fix": "int a = 10;",
  "explanation": "C++ statements must end with semicolon"
}
```
