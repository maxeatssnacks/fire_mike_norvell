# Fire Mike NorveLLLL

Interactive landing page with an elusive button that runs away from your mouse!

## Features

- 🎯 **Elusive Button**: Runs away from mouse on desktop, stationary on mobile
- 📊 **Persistent Counter**: "Norvell Fans" is a global page-view count stored in Upstash Redis
- ☕ **Buy Me a Coffee**: Integrated donation button
- 📱 **Mobile Optimized**: Touch-friendly design
- 🎨 **FSU Themed**: Florida State University background and styling

## Setup for Vercel Deployment

### 1. Create an Upstash Redis database

Either install the **Upstash** integration from the Vercel Marketplace (it adds the
env vars below to the project automatically), or create a free database at
[upstash.com](https://upstash.com) and copy its REST URL and token.

### 2. Set environment variables

In Vercel → Project → Settings → Environment Variables:

| Variable                   | Value                          |
| -------------------------- | ------------------------------ |
| `UPSTASH_REDIS_REST_URL`   | Your database's REST URL       |
| `UPSTASH_REDIS_REST_TOKEN` | Your database's REST token     |

(`KV_REST_API_URL` / `KV_REST_API_TOKEN` from the older Vercel KV integration are accepted too.)

### 3. Deploy

Connect your GitHub repository to Vercel and deploy. The static site is served from
`public/` and the counter API from `api/counter.js`.

## Counter Persistence

`api/counter.js` talks to Upstash Redis over its REST API (plain `fetch`, no SDK):
- `POST /api/counter` → `INCR` on the view key, returns the new count
- `GET /api/counter` → returns the current count
- Global count across all users, survives deploys and cold starts
- If the API is unreachable, the page falls back to a per-browser localStorage count

## Mobile vs Desktop

- **Desktop**: Button dodges the mouse 4 times (`MAX_DODGES` in `public/script.js`), then settles back in the center and becomes clickable
- **Mobile**: Button stays stationary and is immediately clickable

## Files Structure

```
├── public/
│   ├── index.html      # Main page
│   ├── styles.css      # All styling
│   ├── script.js       # JavaScript functionality
│   └── images/
│       ├── FSU_Sparklers.jpeg    # Background image
│       └── sad_seminole.jpeg     # Favicon
├── api/
│   └── counter.js      # Upstash Redis counter API
├── vercel.json         # Serves public/ as the site root
└── package.json
```

## Dependencies

- **No npm dependencies** - the counter uses Upstash's REST API via `fetch`
- Requires the two Upstash env vars above (Upstash's free tier is plenty)

## License

MIT
