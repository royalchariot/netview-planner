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
```

## 2. Enable OTP-style signup emails

In Supabase, open **Authentication > Email Templates**.

For the signup confirmation email, include the token variable in the email body:

```text
Your NetView verification code is: {{ .Token }}
```

If the template only uses `{{ .ConfirmationURL }}`, users will receive a magic link instead of a numeric OTP.

## 3. Redeploy GitHub Pages

Build with the env vars present:

```bash
GITHUB_PAGES=true npm run build
```

Then publish the `dist` output to the `gh-pages` branch as before.
