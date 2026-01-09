# Starlink Jewels - Next.js Quick Start Guide

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📁 Project Structure

- **`src/app/`** - Next.js App Router pages (new)
- **`src/pages/`** - Legacy page components (still in use)
- **`src/components/`** - Reusable React components
- **`src/hooks/`** - Custom React hooks
- **`src/lib/`** - Utility functions and helpers
- **`src/assets/`** - Images and media files
- **`public/`** - Static files served directly

## 🔄 Routing

The app uses Next.js App Router with file-based routing:

| File Location | URL Route |
|---|---|
| `src/app/page.tsx` | `/` |
| `src/app/about/page.tsx` | `/about` |
| `src/app/categories/page.tsx` | `/categories` |
| `src/app/category/[id]/page.tsx` | `/category/:id` |
| `src/app/blog/page.tsx` | `/blog` |
| `src/app/contact/page.tsx` | `/contact` |
| `src/app/gallery/page.tsx` | `/gallery` |
| `src/app/buying-guide/page.tsx` | `/buying-guide` |
| `src/app/buying-guide/[slug]/page.tsx` | `/buying-guide/:slug` |
| `src/app/admin/page.tsx` | `/admin` |

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Next Themes** - Theme switching (light/dark mode)
- **Shadcn/ui** - Component library based on Radix UI

## 📦 Key Dependencies

- `next` - React framework for production
- `react` & `react-dom` - React library
- `tailwindcss` - Utility CSS framework
- `@radix-ui/*` - Headless UI components
- `@hookform/resolvers` - Form validation
- `@tanstack/react-query` - Data fetching
- `gsap` - Animation library
- `firebase` - Backend services
- `sonner` - Toast notifications

## 🔧 Environment Setup

Create a `.env.local` file for environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# Add other environment variables as needed
```

## 📝 Creating New Pages

To create a new page:

1. Create a directory in `src/app/`
2. Add a `page.tsx` file
3. Export a default React component

Example: Create `/pricing`
```bash
mkdir -p src/app/pricing
```

```tsx
// src/app/pricing/page.tsx
export default function PricingPage() {
  return <div>Pricing Page</div>
}
```

## 🧩 Creating New Components

Place new components in `src/components/`:

```tsx
// src/components/MyComponent.tsx
'use client';  // Add if component uses hooks/state

export default function MyComponent() {
  return <div>My Component</div>
}
```

## 🔗 Navigation

Use Next.js `Link` component for navigation:

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  )
}
```

## 📱 Client vs Server Components

- **Server Components** (default) - Rendered on the server
- **Client Components** - Add `'use client'` at the top

```tsx
'use client'  // This makes it a client component

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 🐛 Debugging

### Common Issues

**"useState only works in Client Components"**
- Add `'use client'` at the top of your file

**"location is not defined"**
- Use `usePathname()` from `next/navigation` instead

**"useParams() returns undefined"**
- Ensure you're using it in a Client Component with `'use client'`

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)

## 🚢 Deployment

The project is ready to deploy on:
- **Vercel** (recommended for Next.js)
- **AWS**, **Google Cloud**, **Azure** (with Node.js runtime)
- **Self-hosted** (requires Node.js server)

### Vercel Deployment
```bash
npm i -g vercel
vercel
```

## 📞 Support

For issues or questions:
1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review the project's MIGRATION_SUMMARY.md
3. Check existing code for patterns

---

**Happy coding! 🎉**
