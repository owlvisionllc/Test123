# Getting people signed in — the short way and the Google way

Two routes to the same place. Do the short one first.

---

# ROUTE A — magic links (start here)

No Google Cloud. No OAuth client. About ten minutes.

Someone types their work email, gets a link in their inbox, taps it, they're in. The link expires in an hour and can only be used once.

## A1 · Turn it on

Supabase dashboard → **Authentication** → **Sign In / Providers**.

- **Email** — make sure it's enabled. It is by default.
- Turn **Confirm email** ON.
- Turn **Enable email provider sign-up** ON for now. The trigger in A3 is what keeps strangers out.

## A2 · Tell it where your app lives

**Authentication** → **URL Configuration**.

- **Site URL** → your Netlify address, e.g. `https://owlvisionportal.netlify.app`
- **Redirect URLs** → add these two:
  ```
  https://owlvisionportal.netlify.app/**
  http://localhost:5173/**
  ```

The second one is so it works while you're building on your own machine. The `/**` matters — without it only the exact homepage is allowed back.

## A3 · Lock it to the company

**SQL Editor** → New query → paste → Run:

```sql
create or replace function block_outside_domain()
returns trigger language plpgsql security definer as $$
begin
  if new.email not like '%@owlvisionllc.com' then
    raise exception 'Only Owl Vision accounts can sign in';
  end if;
  return new;
end $$;

drop trigger if exists enforce_domain on auth.users;
create trigger enforce_domain
  before insert on auth.users
  for each row execute function block_outside_domain();
```

This is the actual lock. Anyone who isn't on your domain gets refused at the database, whatever they try to sign in with — magic link, Google, anything you add later.

## A4 · Prove it works before writing any code

**Authentication** → **Users** → **Add user** → **Send invitation**.

Try it twice:

- Your own `@owlvisionllc.com` address → the invite sends.
- Any gmail address → it fails with *Only Owl Vision accounts can sign in*.

If the second one succeeds, the trigger didn't take. Re-run A3.

## A5 · One thing to know about the free email

Supabase's built-in mailer is capped at a few messages an hour and lands in spam more often than not. Fine for you and Barry testing. Not fine for twenty people.

When you're ready for the team, add SMTP under **Project Settings → Authentication → SMTP Settings**. Your Google Workspace can send it — host `smtp.gmail.com`, port `587`, your address as the username, and an **app password** (not your real password) generated from your Google account security page. Sender address should be something like `portal@owlvisionllc.com`.

**Done. Skip to the checklist at the bottom.** Come back to Route B whenever you want the one-tap version.

---

# ROUTE B — Google sign-in

Two consoles that have to agree with each other. That's the whole difficulty. Google's console also gets rearranged periodically, so match the *idea* of each step rather than hunting for an exact button.

## B1 · Get your callback URL first

Supabase → **Authentication** → **Sign In / Providers** → **Google**. Near the top is a **Callback URL**. Copy it. It looks like:

```
https://abcdefghijklm.supabase.co/auth/v1/callback
```

Leave this tab open. Google needs this exact string, character for character.

## B2 · Make a Google Cloud project

[console.cloud.google.com](https://console.cloud.google.com) — sign in with your Workspace account, not a personal gmail.

Top left, the project dropdown → **New Project** → name it `Owl Vision Portal` → Create. Make sure the new project is selected afterwards.

## B3 · The consent screen

Left menu → **Google Auth Platform** (older consoles: **APIs & Services → OAuth consent screen**).

- **User type: Internal.** This is the important one. Internal means only accounts inside your Workspace org can even reach the sign-in prompt.
- App name: `Owl Vision PM Portal`
- Support email and developer contact: your address
- Scopes: `email`, `profile`, `openid`. Nothing else. Don't add Drive or Calendar scopes — extra scopes trigger a Google review process you do not want to be in.

If **Internal** is greyed out, you're signed in with a personal account rather than your Workspace one.

## B4 · Create the client

Left menu → **Clients** (older: **APIs & Services → Credentials**) → **Create client**.

- Application type: **Web application**
- Name: `Owl Vision Portal Web`
- **Authorized JavaScript origins** — the site itself, no trailing slash:
  ```
  https://owlvisionportal.netlify.app
  http://localhost:5173
  ```
- **Authorized redirect URIs** — paste the callback from B1, exactly:
  ```
  https://abcdefghijklm.supabase.co/auth/v1/callback
  ```

Create. A box appears with a **Client ID** and a **Client secret**. Copy both now — the secret is easier to regenerate than to retrieve.

## B5 · Paste them back into Supabase

Back on the Google provider page: enable it, paste the Client ID and Client secret, Save.

## B6 · Test

Open your site in a private window and tap Sign in with Google. Your work account should go straight through.

### When it doesn't

- **redirect_uri_mismatch** — the URI in B4 doesn't match B1 exactly. Usually a trailing slash, `http` instead of `https`, or the wrong project ref. Compare them character by character.
- **This app is blocked / access denied** — the account isn't in your Workspace org, which is Internal doing its job.
- **Signs in, then lands back on the login screen** — your Netlify URL isn't in the Redirect URLs list from A2.
- **Changes not taking effect** — Google caches OAuth config for a few minutes. Wait, then try a fresh private window.

The domain trigger from A3 still applies here. Leave it in place; it's the layer that survives someone loosening a provider setting later.

---

# Checklist

- [ ] Email provider on, Confirm email on
- [ ] Site URL and both Redirect URLs set
- [ ] Domain trigger installed **and tested with a gmail address**
- [ ] Yourself promoted to admin:
      `update profiles set role = 'admin' where email = 'davidb@owlvisionllc.com';`
- [ ] SMTP configured before more than two people use it
- [ ] Google sign-in — later, once the portal is real

The only step with no shortcut is testing the trigger with an outside address. Everything else announces itself when it's wrong. That one fails silently, and it's the one holding the door.
