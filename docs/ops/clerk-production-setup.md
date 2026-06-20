# Clerk Production Setup (and why signup emails don't arrive in dev)

## Why verification emails don't arrive in development

Nuzzle authenticates with **Clerk**. In a **development instance** (keys `pk_test_…` / `sk_test_…`,
domain `*.clerk.accounts.dev`), Clerk sends verification/OTP emails from a **shared, low-reputation
`accounts.dev` sender**. Receiving mail servers judge that sender, so these emails are routinely
filtered to spam or **silently dropped** — even on your very first signup. This is **not** a rate
limit and **not** a bug in the app:

- Clerk middleware is correctly configured in [`proxy.ts`](../../proxy.ts) (Next.js 16's filename for
  middleware) with `clerkMiddleware()` + a route matcher.
- The auth pages just render Clerk's `<SignIn/>` / `<SignUp/>`; there is **no custom email/SMTP code**
  in the repo. Clerk owns 100% of auth email.

**The fix is a production instance that sends from your own verified domain** (SPF/DKIM), which makes
the emails actually deliver.

### Dev shortcut: test without email

In a development instance you can complete signup without any email:

1. On `/signup`, use an email containing `+clerk_test`, e.g. `you+clerk_test@gmail.com`.
2. When prompted for the code, enter **`424242`**. No real email is sent; the account is created.

Use this for local testing. It is dev-instance only.

---

## Go-live: move Clerk to a production instance with your domain

> The work below is in the Clerk dashboard, your DNS host, and your hosting provider (Vercel).
> Local `.env` stays on the **dev** keys — `pk_live` only works on the production domain, not `localhost`.

### A. Create the production instance
1. dashboard.clerk.com → open the app → **environment dropdown** (top-left, "Development") →
   **Create production instance** → **Clone from development** (carries over email/password, social
   providers, and email templates).

### B. Set the production domain
2. Enter the domain the app will be served from (e.g. `yourdomain.com` or `app.yourdomain.com`).
   Clerk's Frontend API will live at `clerk.<that domain>`.

### C. Add DNS records (this is what fixes email delivery)
3. At your DNS host, add every record Clerk lists — copy the targets **exactly** (they're unique per
   instance). It's ~5 CNAMEs:

   | Subdomain | Purpose |
   |-----------|---------|
   | `clerk` | Frontend API |
   | `accounts` | Account Portal |
   | `clkmail` | **Email send host** |
   | `clk._domainkey` | **DKIM key 1** |
   | `clk2._domainkey` | **DKIM key 2** |

   The last three (`clkmail`, `clk._domainkey`, `clk2._domainkey`) are the **email/DKIM** records that
   make verification codes deliver. On Cloudflare, set these to **DNS only** (grey cloud), not proxied.
4. Click **Verify** in Clerk. DNS can take minutes to ~48h; wait until all records (especially the mail
   records) show verified.

### D. Production keys into the host (not local)
5. Production instance → **API Keys** → copy `pk_live_…` and `sk_live_…`.
6. In the host (Vercel → Project → Settings → **Environment Variables**, scope **Production**) set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`
   - `CLERK_SECRET_KEY=sk_live_…`
   - keep `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`,
     `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/search`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/questionnaire`
   - ensure `DATABASE_URL`, `RESCUEGROUPS_API_KEY`, `GROQ_API_KEY` are set for Production too.
7. Vercel → Project → **Domains** → add your domain (follow its DNS step), then **redeploy** so the live
   keys take effect.

### E. Social login (Google / Apple) — the next gotcha
8. Development uses Clerk's **shared** OAuth credentials; **production requires your own**. In the prod
   instance → **User & Authentication → SSO Connections** → Google/Apple → enable **custom credentials**
   and paste a Google Cloud OAuth client (and Apple Service ID/key). Until then, those buttons error in
   production — email/password works as soon as DNS verifies.

### F. Verify
9. Visit `https://<domain>/signup`, sign up with a real email → the code now arrives from your domain →
   completes and redirects to `/questionnaire`.

---

## Key convention

| Environment | Keys | Where they live |
|-------------|------|-----------------|
| Local dev | `pk_test_` / `sk_test_` | local `.env` (gitignored) |
| Production | `pk_live_` / `sk_live_` | host (Vercel) Production env vars — **never committed** |
