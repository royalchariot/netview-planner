# Supabase Email OTP Setup

NetView uses Supabase Auth for real email OTP during signup.

## 1. Create a Supabase project

Create a free Supabase project, then copy:

- Project URL
- Project anon/public key

Add them locally in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AUTH_REDIRECT_URL=https://royalchariot.github.io/netview-planner/#signup
```

## 2. Enable OTP-style signup emails

In Supabase, open **Authentication > Email Templates**, then open **Confirm signup**.

Replace the link-style content that uses `{{ .ConfirmationURL }}` with OTP text that includes `{{ .Token }}`:

```html
<h2>Your NetView Planner verification code</h2>
<p>Enter this 6-digit code in NetView Planner to finish creating your account:</p>
<h1>{{ .Token }}</h1>
<p>This code expires soon. If you did not request it, you can ignore this email.</p>
```

If the template only uses `{{ .ConfirmationURL }}`, users will receive a magic link instead of a numeric OTP.

## 3. Fix redirect URLs

In Supabase, open **Authentication > URL Configuration**.

Set **Site URL** to:

```text
https://royalchariot.github.io/netview-planner/
```

Add this to **Redirect URLs**:

```text
https://royalchariot.github.io/netview-planner/**
```

## 4. Redeploy GitHub Pages

Build with the env vars present:

```bash
GITHUB_PAGES=true npm run build
```

Then publish the `dist` output to the `gh-pages` branch as before.
