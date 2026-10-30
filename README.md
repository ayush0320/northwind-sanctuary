# Northwind Sanctuary

A one-page website for Northwind Sanctuary (Greater Noida) with a small Node.js backend that stores enquiries from the contact form.

## Structure

```
public/            Frontend (served as static files)
  index.html
  css/style.css
  js/main.js       Birds animation, master plan, EMI calculator, contact form
server/server.js   Express backend and REST API
data/              enquiries.json is created here at runtime (git-ignored)
```

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
ADMIN_KEY=choose-a-secret npm start
```

Open http://localhost:3000. Use `npm run dev` to restart automatically on changes.

## API

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/contact` | Saves an enquiry. Body: `name`, `mobile`, `email`, `message`, `newsletter`. Limited to 10 requests per 15 minutes per IP. |
| GET | `/api/enquiries` | Lists enquiries, newest first. Send your key in the `x-admin-key` header. |
| GET | `/api/health` | Returns `{ "status": "ok" }`. |

```bash
curl -H "x-admin-key: choose-a-secret" http://localhost:3000/api/enquiries
```

## Environment variables

| Name | Purpose |
| --- | --- |
| `PORT` | Port to listen on (default 3000) |
| `ADMIN_KEY` | Secret for `/api/enquiries`. If unset, that route stays locked. |
| `ALLOWED_ORIGIN` | Only needed if the frontend is hosted on a different domain, e.g. `https://username.github.io` |

## Deploying

- **Everything together:** host the whole project on a Node host such as Render or Railway (start command `npm start`). Note that the JSON file is wiped on hosts with temporary disks; switch to a database for production.
- **Frontend on GitHub Pages:** publish the `public/` folder, deploy the backend elsewhere, set `ALLOWED_ORIGIN` on the backend, and put the backend URL in `<meta name="api-base" content="https://your-backend.example.com">` in `public/index.html`.

## To do before publishing

Add the real team names, RERA number, brochure link and project photos (the images are currently drawn with CSS and SVG), and replace the sample blog posts.
