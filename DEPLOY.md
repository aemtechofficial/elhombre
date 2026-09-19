# EL HOMBRE — Deployment Guide

Complete production deploy in ~15 minutes. No prior experience needed.

---

## 1. Push code to GitHub

```bash
git init
git add .
git commit -m "EL HOMBRE store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/elhombre.git
git push -u origin main
```

## 2. Create the database (Supabase OR Neon — free, pick one)

**Option A · Supabase**

1. Go to [supabase.com](https://supabase.com) → **Sign up** → **New Project**
2. Name: `elhombre` · set a database password (letters + numbers only, avoid `@ # %` in the password or URL-encode them: `@` → `%40`)
3. **Settings → Database → Connection String → URI**, looks like:
   `postgresql://postgres:YOUR-PASSWORD@db.xxxxxx.supabase.co:5432/postgres`
4. Replace `YOUR-PASSWORD` with your real password. That string is your `DATABASE_URL`.
5. Note: Supabase free tier pauses after ~7 days of inactivity; opening the dashboard wakes it, no data loss.

**Option B · Neon**

1. Go to [neon.tech](https://neon.tech) → **Sign up** → **New Project**
2. Name: `elhombre` · Region: closest to your customers
3. Copy the **connection string**, it looks like:
   `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/elhombre?sslmode=require`

## 3. Import on Vercel (free)

1. [vercel.com](https://vercel.com) → **Add New → Project** → Import your GitHub repo
2. Framework auto-detects **Next.js** — do not touch build settings
3. Open **Environment Variables** and add ALL rows from the table below
4. Click **Deploy** — wait ~2 minutes

| Variable | Example | Why |
|---|---|---|
| `DATABASE_URL` | `postgresql://...neon.tech/elhombre?sslmode=require` | Store database |
| `NEXT_PUBLIC_SITE_URL` | `https://elhombre.pk` | SEO canonicals, sitemap, Meta feed |
| `ADMIN_PASSWORD` | pick a strong one | Locks `/admin` |

Optional (add anytime, storefront never breaks without them):
| Variable | Example |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | fallback pixel id if you prefer env over admin panel |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | same |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | same |

*(Pixel IDs are primarily set from Admin → Theme Settings → Integrations. No redeploy needed.)*

## 4. Create the tables

On your own machine, in the project folder:

```bash
DATABASE_URL="your-neon-connection-string" npx drizzle-kit push
```

That is it for the database. **Products + reviews seed themselves automatically** the first time anyone opens the homepage (9 perfumes + 10 reviews).

## 5. Post-deploy checklist (5 min)

1. **Admin** → visit `https://yourdomain.com/admin` → login (default `noir2024` or your `ADMIN_PASSWORD`)
2. **Theme Settings → General** → set real WhatsApp number, email, address
3. **Theme Settings → Integrations** → paste Meta Pixel ID (for ads)
4. **Meta Commerce Manager** → add catalog feed: `https://yourdomain.com/feed.xml`
5. Test one COD Express order on a product page

## 6. Connect your domain

1. Vercel → Project → **Settings → Domains** → add `elhombre.pk`
2. At your domain provider add the DNS record Vercel shows (A record `76.76.21.21` or CNAME `cname.vercel-dns.com`)
3. SSL (https) is automatic within minutes
4. Update `NEXT_PUBLIC_SITE_URL` to the final domain → Redeploy (Vercel → Deployments → ⋯ → Redeploy)

---

### Costs

| Item | Cost |
|---|---|
| Vercel hosting | Rs 0 (Hobby tier) |
| Neon database | Rs 0 (free tier) |
| Domain | ~Rs 3,000/year (your only cost) |

### Useful commands

| Task | Command |
|---|---|
| Apply schema changes | `npx drizzle-kit push` |
| Reseed products | `DATABASE_URL=... npx tsx scripts/seed.ts` |
| Run locally | `npm run dev` |

### Notes

- Never commit the real `.env` to GitHub (it is already git-ignored)
- Every redeploy takes ~2 minutes and never touches your database
- Orders, reviews and settings live in the database — they survive every deploy
