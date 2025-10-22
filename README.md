# Fire Mike NorveLLLL

Interactive landing page with an elusive button that runs away from your mouse!

## Features

- 🎯 **Elusive Button**: Runs away from mouse on desktop, stationary on mobile
- 📊 **Persistent Counter**: Uses Upstash Redis for global click tracking
- ☕ **Buy Me a Coffee**: Integrated donation button
- 📱 **Mobile Optimized**: Touch-friendly design
- 🎨 **FSU Themed**: Florida State University background and styling

## Setup for Vercel Deployment

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Deploy! (No environment variables needed)

## Counter Persistence

The counter uses **CountAPI** (100% FREE) for true persistence:
- ✅ **Completely free** - No charges ever
- ✅ Survives server restarts
- ✅ Global count across all users
- ✅ No setup required
- ✅ No dependencies

## Mobile vs Desktop

- **Desktop**: Button runs away from mouse for 15 seconds, then becomes clickable
- **Mobile**: Button stays stationary and is immediately clickable

## Files Structure

```
├── index.html          # Main page
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── api/
│   └── counter.js      # Redis counter API
├── images/
│   ├── FSU_Sparklers.jpeg    # Background image
│   └── sad_seminole.jpeg     # Favicon
└── package.json        # Dependencies
```

## Dependencies

- **No dependencies needed!** - Uses free CountAPI service
- No environment variables required
- No paid services

## License

MIT
