# Polonyadaki Avukatım — Architecture & Health Analysis

**Date:** 2026-09-07  
**Scope:** Read-only review of `main` at `81b41f8`. No application, schema, or CI files were changed.  
**Audience:** Solo developer who needs a concrete next-sprint list.  
**Live URL (from docs):** https://polonyadaki-avukatimm-ten.vercel.app  
**Repo:** https://github.com/ay7olon/polonyadaki-avukatimm (public)

This writeup is grounded in files that were actually read. Path citations point at the current tree.

---

## 1. Executive verdict

The product is a **working pilot SPA**: clients can register, open a case, upload documents, and chat; lawyers can list cases, assign colleagues, approve/reject documents, and leave private notes. Auth, RLS, Storage, and Realtime are real — not mocked in the running UI.

It is **not yet a safe production legal portal**. Three structural gaps dominate:

1. **RLS is enabled everywhere, but several write policies do not constrain columns.** A logged-in client can likely self-promote to `lawyer`/`admin` and spoof message/document fields. The UI does not do this; the API will.
2. **Deadline automation is UI-only.** `deadline_at` is mapped and badged, but no migration creates the column or the `compute_case_deadline()` trigger that comments describe.
3. **Docs over-claim CI.** README describes `.github/workflows/ci.yml`; that file was deleted on the pilot branch and is absent from `main`. GitHub Actions has no runs.

For a closed-circle pilot with trusted testers, the app is usable. For any real client PII, fix the RLS write policies and rotate historically published demo passwords **before** inviting more people.

---

## 2. Application map

### 2.1 Navigation model (not a router)

There is **no React Router**. Screens are a `ScreenId` union and a `useState` in `src/App.tsx`. Refresh always starts at `'landing'`; logged-in users stay on the landing page until they click nav (the auth effect only auto-redirects away from `'auth'` and away from the wrong role’s screens). URLs never change. Bookmarking, back-button, and shareable case links do not exist. `vercel.json` / `netlify.toml` / `nginx.conf` already have SPA fallbacks for a future router.

| `ScreenId` | File | Who | Purpose |
| --- | --- | --- | --- |
| `landing` | `src/views/LandingScreen.tsx` | Public | Marketing, services, FAQ, mock lawyer roster |
| `auth` | `src/views/AuthScreen.tsx` | Public | Login, register, forgot password, recovery update |
| `client_dashboard` | `src/views/ClientDashboardScreen.tsx` | Client | Cases, “Belgelerim”, profile edit, reminders |
| `new_application` | `src/views/NewApplicationWizardScreen.tsx` | Client | 4-step case create + optional uploads |
| `case_timeline` | `src/views/CaseTimelineScreen.tsx` | Client | Timeline, docs, deadline badge, extra upload |
| `messaging` | `src/views/MessagingScreen.tsx` | Client (staff are redirected away) | Per-case chat + attachments |
| `admin_case_list` | `src/views/AdminCaseListScreen.tsx` | Lawyer / admin | Filters, urgency counts, table |
| `admin_case_detail` | `src/views/AdminCaseDetailScreen.tsx` | Lawyer / admin | Status, assignment, doc review, notes, mini-chat |

Route guards live in `src/App.tsx` (`PUBLIC_SCREENS` / `CLIENT_SCREENS` / `STAFF_SCREENS`). They are **client-side only**. Real isolation is RLS.

Staff (`lawyer` **or** `admin`) cannot open client screens; clients cannot open admin screens. `admin` is not a distinct capability — both staff roles get the same UI (`isStaff` in `App.tsx` and `Header.tsx`).

### 2.2 Auth roles

| Role | How it is assigned | What they can do in the UI |
| --- | --- | --- |
| `client` | Default on signup via `handle_new_user()` | Own cases, uploads, profile, messaging |
| `lawyer` | Seed script / Dashboard (not self-serve) | All cases, assignment, doc approve/reject, internal notes |
| `admin` | Enum exists; **no unique UI or policy** | Same as lawyer |

Signup always writes `role = 'client'` (`supabase/migrations/20260803093801_enums_and_profiles.sql` and the later `handle_new_user` in `20260803120000_profiles_email_column.sql`). There is no in-app “promote to lawyer” flow. Promotion is expected to be a Dashboard/`service_role` update — but see §4.2 because the client can also `UPDATE` their own `role`.

Session + profile: `src/hooks/useAuth.ts`. Password recovery uses `onAuthStateChange` event `PASSWORD_RECOVERY` and forces the auth screen. `emailRedirectTo` / reset `redirectTo` are `window.location.origin`.

### 2.3 Data model (migrations)

All schema is under `supabase/migrations/`. There is **no** `supabase/config.toml` and **no** generated `Database` types.

```
auth.users 1:1 public.profiles
                 │
                 ├── legal_cases (client_id, assigned_lawyer_id)
                 │      ├── case_documents
                 │      ├── case_timeline_steps
                 │      ├── case_internal_notes (staff-only)
                 │      └── case_messages  + Realtime publication
                 └── storage.buckets.case-documents (private)
```

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id`, `full_name`, `phone`, `role`, `language_pref`, `rodo_accepted_at`, `email` (added later) | Trigger on `auth.users` insert |
| `legal_cases` | `case_number` unique, `status`, `urgency`, `form_summary` jsonb, `progress_percent` | **No `deadline_at` column** |
| `case_documents` | `storage_path`, `status`, `rejection_reason` | Metadata + Storage object |
| `case_timeline_steps` | `sort_order`, `status` | Auto-seeded on case insert |
| `case_internal_notes` | `is_private`, `author_id` | Staff `FOR ALL` |
| `case_messages` | `sender_role`, `attachments` jsonb | Added to `supabase_realtime` |

Enums in `20260803093801_enums_and_profiles.sql` match `src/types.ts` (categories, statuses, urgency, document/timeline/message roles).

`seed_case_timeline()` (`20260803120500_auto_seed_case_timeline.sql`) inserts two steps on every new case. Execute is revoked from `anon`/`authenticated`. If the seed script also inserts a full timeline (`supabase/seed/seed.ts`), you get **duplicate steps** on seeded cases.

There is **no `DELETE` policy** on cases/documents/messages/profiles (default deny). Staff can delete Storage objects; clients cannot.

### 2.4 RLS posture (summary)

Pattern is sound: RLS on every table, `current_user_role()` as `SECURITY DEFINER` with `search_path = public` to avoid recursive profile reads.

| Object | SELECT | INSERT | UPDATE | Gap |
| --- | --- | --- | --- | --- |
| `profiles` | Own row, or any row if staff | Own `id` | Own `id`, **all columns** | Role self-escalation; staff cannot edit other profiles |
| `legal_cases` | Own as client; all if staff | Own `client_id` or staff | Staff only | Client INSERT does not lock `status` / `urgency` / `assigned_lawyer_id` / `progress_percent` |
| `case_documents` | Case participants | Case participants | Staff | Client INSERT does not lock `status` |
| `case_timeline_steps` | Case participants | Staff | Staff | OK |
| `case_internal_notes` | Staff only (`FOR ALL`) | Staff | Staff | Any lawyer sees **all** notes on **all** cases |
| `case_messages` | Case participants | `sender_id = auth.uid()` + case access | none | `sender_role` not forced to match profile |
| `storage.objects` (`case-documents`) | First path segment = `case_id` + access | Same | Staff | No mime/size rules in SQL |

`handle_new_user` execute is revoked from `public`/`anon`/`authenticated` (`20260803093808_security_advisor_fixes.sql`) — good.

Staff scope is **firm-wide**, not “assigned lawyer only”. Fine for a 3-lawyer office; wrong if you later add external paralegals.

### 2.5 Messaging

- Load + live INSERT via `src/hooks/useCaseMessages.ts` (`postgres_changes` on `case_messages`, filter `case_id=eq.{id}`).
- `useCases` **also** nested-selects all messages for all visible cases (`CASE_SELECT` in `src/hooks/useCases.ts`), so the thread is fetched twice.
- Attachments upload to Storage (`${caseId}/...`) and are stored as JSON on the message row, **not** as `case_documents` rows. They will not appear on “Belgelerim” / the case document list.
- Realtime is enabled in SQL (`alter publication supabase_realtime add table public.case_messages`). Confirm in the hosted project that **Realtime authorization / RLS** is on; a client-side `filter` is not a substitute.

Staff chat UI lives on `AdminCaseDetailScreen`; clients are routed to `MessagingScreen`. Staff cannot open the client messaging screen (guard). That is OK as long as admin detail chat stays wired.

### 2.6 Storage

- Private bucket `case-documents` (`20260803093807_storage_bucket_and_policies.sql`).
- Path convention: `<case_id>/<timestamp>-<safeName>` (`src/lib/storage.ts`). Matches `storage.foldername(name)[1]`.
- View/download: 5-minute signed URLs (`getSignedDocumentUrl`).
- Client-side allowlist: pdf/jpg/jpeg/png/doc/docx, 15 MB (`src/lib/validation.ts`). **Comment claims this “matches … Supabase Storage policy”; the storage migration has no size or MIME check.**
- Timeline upload (`CaseTimelineScreen` → `App.handleUploadDocument`) **does not call** `validateUploadFile`. Wizard and messaging do.

### 2.7 Deadlines

End-to-end intended design:

1. DB column `deadline_at` + trigger `compute_case_deadline()` (referenced only in a comment in `src/lib/deadline.ts`).
2. Mapper copies `row.deadline_at` → `LegalCase.deadlineAt` (`src/lib/caseMappers.ts`).
3. `getDeadlineInfo()` + `DeadlineBadge` + `useNowTick` (60s) on client dashboard, timeline, admin list/detail.

**What exists:** (2) and (3), plus unit tests.  
**What does not exist:** any migration adding `deadline_at` or a compute trigger. Urgency labels in the wizard (“48h Kırmızı Kod”, “15 Gün”) are copy only. Admin “overdue / due soon” counters will stay at zero against a real schema. Selecting `deadline_at` in PostgREST would error; the mapper still types it, so either the hosted DB has a column that was applied out-of-band, or that field is always null/absent. Treat “deadline automation” as **not shipped**.

---

## 3. Stack usage — strengths and smells

Claimed stack from `README.md` / `package.json`: React 19, Vite 6, Tailwind CSS 4, TypeScript ~5.8, Supabase JS 2.112, Vitest 4.

### Strengths (keep)

- **Right backend for a solo legal portal:** Postgres + Auth + Storage + Realtime without a custom API. RLS + `SECURITY DEFINER` role helper is the correct shape.
- **Tailwind 4 `@theme` tokens** in `src/index.css` (`navy` / `gold` / `canvas` / display serif) keep Legal Navy consistent without a component library.
- **Vite 6 chunk split** (`vendor-react`, `vendor-supabase`, `vendor-icons`) is a sensible small-app optimization (`vite.config.ts`).
- **Deploy surface is complete:** Vercel (live), Netlify config, Docker/nginx:8080 for Cloud Run. SPA rewrites + hashed-asset cache headers are in place.
- **Unit tests exist for the only pure logic** (deadlines, validation, mappers) and they match the code.
- **Auth hardening already happened:** demo buttons gated on `import.meta.env.DEV` + env (`AuthScreen.tsx`); service role never prefixed `VITE_`; `.env*` gitignored.

### Smells (fix when you touch the area)

| Smell | Where | Why it hurts |
| --- | --- | --- |
| Package name `react-example` | `package.json` | Template leftover |
| `vite` in both `dependencies` and `devDependencies` | `package.json` | Duplicate; `dotenv` is also a runtime dep for a static SPA |
| `lint` = `tsc --noEmit` only | `package.json` | No ESLint, no unused-export check |
| **`strict` is not set** | `tsconfig.json` | Default is non-strict; `as any` / `as unknown as` compile |
| `allowJs`, `experimentalDecorators` | `tsconfig.json` | AI Studio leftovers |
| No Vitest block | `vite.config.ts` | Tests work on defaults; no coverage gate |
| No generated DB types | — | Nested selects are hand-typed (`DbLegalCase`) |
| God-component `App.tsx` (~425 lines) | mutations + guards + screen switch | Hard to test; no URL |
| `useCases` comment still says “Faz 4/5/6” local state | `src/hooks/useCases.ts` | Mutations **do** persist; local `setCases` is a second cache |
| i18n is a header/landing dictionary | `src/data/mockData.ts` `UI_TRANSLATIONS` | Auth, wizard, dashboards, footer are Turkish-only; Auth receives `currentLanguage` and does not translate copy |
| `Footer` ignores `currentLanguage` | `src/components/Footer.tsx` | Prop is unused |
| Template `metadata.json` Gemini capability | repo root | Irrelevant to this app |
| `CursorNotesDrawer` + `designNotes.ts` unused | `src/components/`, `src/data/` | Dead (~350 lines) |
| Theme HTML in `public/` | `legal-navy-demo.html`, `quiet-trust-demo.html` | Shipped on production if not blocked |
| Fake trust / registry copy | Landing metrics, Footer KRS/NIP/phone | Live site currently presents placeholder legal identity |

React 19 + Vite 6 is not a problem. The mismatch is **SPA-as-product without a router, types, or CI**, not the framework versions.

---

## 4. Security

### 4.1 Env / secrets / client-exposed keys

| Variable | Exposure | Assessment |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Baked into the browser bundle (`src/lib/supabaseClient.ts`) | Expected. Safety depends entirely on RLS. |
| `VITE_DEMO_*` | Dev bundle only; buttons also require `import.meta.env.DEV` | Production buttons are off. Do not set `VITE_DEMO_PASSWORD` on Vercel. |
| `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_PASSWORD` | Seed script only (`supabase/seed/seed.ts`) | Correctly undocumented as `VITE_`. Seed **prints the password to stdout**. |
| Docker `--build-arg` | Image layers / Cloud Build logs | Anon key in image is the same public key; still avoid logging. |

`.env.example` is clean placeholders. `.gitignore` has `.env*` + `!.env.example`. `.dockerignore` excludes `.env*`.

**Anon key in a public repo’s CI secrets** is fine. **Service role must never** be a `VITE_` var or a GitHub Actions `pull_request` secret from forks.

### 4.2 RLS gaps (highest impact)

These are exploitable with the **anon key + a normal client session** (browser console or curl). The UI does not expose them.

1. **`profiles` self-escalation (P0).**  
   Policy `profiles_update_own` is `USING (id = auth.uid())` with no column restriction (`20260803093801_enums_and_profiles.sql`). Postgres uses `USING` as `WITH CHECK` when `WITH CHECK` is omitted, so a client can:

   ```http
   PATCH /rest/v1/profiles?id=eq.<uid>
   { "role": "lawyer" }
   ```

   After that, every staff policy (`current_user_role() in ('lawyer','admin')`) opens: all cases, all PII, internal notes, document approval, Storage delete.

2. **Message impersonation.**  
   `case_messages_insert` checks `sender_id = auth.uid()` but not `sender_role`. A client can insert `sender_role: 'lawyer'` or `'system'`.

3. **Document self-approval.**  
   `case_documents_insert` allows any status. A client can insert `status: 'approved'`.

4. **Case insert field injection.**  
   `legal_cases_insert` only checks `client_id = auth.uid()`. A client can set `status: 'completed'`, `urgency: 'critical'`, `assigned_lawyer_id`, `progress_percent: 100`.

5. **Storage policy ≠ validation.**  
   MIME/size are client-side. Timeline upload skips even that. A client can PUT an `.exe` under their case folder if the bucket allows it.

6. **Realtime.**  
   Subscription filter is the case UUID. If project-level Realtime RLS is off, knowing/guessing a UUID (or leaking one) may stream another case’s messages.

**Not a gap (for this firm size):** lawyers see all cases and all client emails/phones. Document it as a product rule.

**Fail-closed:** missing profile → `current_user_role()` is NULL → policies deny. Good.

This is **not a one-line app fix**. It needs a migration: lock `profiles.role` (trigger or `REVOKE UPDATE (role)`), `WITH CHECK` on inserts, and optionally a Storage file-size limit in the dashboard. Left as analysis-only per the review brief.

### 4.3 Demo auth leakage (public repo)

Commit `81b41f8` correctly removed demo emails/passwords from `README.md` and `PILOT_CHECKLIST.md` and moved seed password to `DEMO_PASSWORD`. **Git history of this public repo still contains them.**

- `8038cca` README / `PILOT_CHECKLIST.md` published a demo login table (role, email, shared password).
- `8038cca` `supabase/seed/seed.ts` hardcoded `DEMO_PASSWORD` in source (later moved to env in `81b41f8`).

Removing from `HEAD` does not un-publish a public git object. Assume those passwords are known.

**Still in `HEAD` (seed targets):**

- Clients: `ahmet.yilmaz@gmail.com`, `elif.kaya@outlook.com`, `m.sahin@polandconsult.com`, `canan.arslan@gmail.com` (`src/data/mockData.ts`)
- Lawyers: `piotr.kowalski.demo@gmail.com`, `zeynep.yilmaz.demo@gmail.com`, `marek.nowak.demo@gmail.com` (`supabase/seed/seed.ts`)

Using **real third-party inboxes you do not control** is a footgun: (a) you may create Auth users for addresses owned by strangers; (b) password-reset mail can land in those inboxes; (c) shared seed password + public emails = account takeover if that project was seeded.

Docs and seed were also **inconsistent** (README used `@test.com` accounts; seed used Gmail/Outlook plus a different hardcoded password). After rotation, keep a private password manager note only.

**Operational actions (not code):** rotate every seeded user’s password; sign out all sessions; delete unused seed users from the production project; never seed production again; prefer `+demo@yourdomain` addresses you own.

### 4.4 Public-repo / deploy footguns

- README previously stated anon keys are “not secret.” Current wording is better, but they still ship in `dist/`. RLS bugs = data bugs.
- No security headers in `vercel.json` / `nginx.conf` (no CSP, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`).
- Footer privacy/terms links are `href="#"` (`Footer.tsx`) — RODO checkbox on register has no linked policy.
- Placeholder KRS / NIP / REGON / Warsaw address / `+48 22 123 45 67` on a **live** marketing page is a compliance and advertising-law risk in PL/TR, not only a polish issue.
- `public/*.html` theme demos are reachable on the same origin as the app.

### 4.5 What was already done well

- Demo UI gated on `DEV` + env (`AuthScreen.tsx` `SHOW_DEMO_LOGINS`).
- Service role never in client.
- Credentials stripped from current docs (`81b41f8`).
- Internal notes never selectable by clients.
- Signed URLs instead of a public bucket.
- Password min length 6 in UI (matches weak Supabase default — consider raising both).

---

## 5. Quality

### 5.1 Tests

| File | What it covers |
| --- | --- |
| `src/lib/deadline.test.ts` | Tones, overdue, invalid dates |
| `src/lib/validation.test.ts` | Email, phone, name, 15 MB / extension |
| `src/lib/caseMappers.test.ts` | Null joins, timeline sort, deadline passthrough |

**Not tested:** `useAuth`, RLS, Storage, Realtime, wizard insert, App guards, document approve/reject, seed script, any view.

No coverage reporter, no `test` job on GitHub (see §5.4). Three test files vs ~7k LOC under `src/` + `supabase/`.

### 5.2 Type safety

- `tsconfig.json` has **no `"strict": true`**, no `noUnusedLocals`, `skipLibCheck: true`, `allowJs: true`.
- `npm run lint` is `tsc --noEmit` against that loose config.
- Escapes: `cat.id as any` in the wizard; `data as unknown as DbLegalCase[]` / `DbMessageRow[]`; Profile `as Profile` from `select('*')`.
- No `database.types.ts` from `supabase gen types`.

### 5.3 Error handling

- User-visible toasts for case load, uploads, status, notes, assignment (`useToast` + `App.tsx`).
- Auth errors shown as Supabase English messages on the form (not localized).
- Wizard: case insert retries 3× on `case_number` collision; document upload failure **does not roll back the case** (orphan case with missing files).
- `useAuth.loadProfile` failure logs to console and sets `profile = null` — user can sit in a session with no role, guards half-apply.
- Completing a case locally marks all timeline steps completed in React state (`handleUpdateCaseStatus`) **without updating `case_timeline_steps` in the DB**. Refresh undoes the visual lie; `progress_percent` is never updated after the wizard’s `10`.

### 5.4 Dead code

| Item | Status |
| --- | --- |
| `src/components/CursorNotesDrawer.tsx` | Never imported |
| `src/data/designNotes.ts` | Only used by the drawer |
| `public/legal-navy-demo.html`, `public/quiet-trust-demo.html` | Not linked from the app; still deployed |
| `INITIAL_CASES` | Only consumed by `supabase/seed/seed.ts` (good) |
| `MOCK_LAWYERS` | Landing + seed |
| `metadata.json` | AI Studio |
| `vite.config.ts` `DISABLE_HMR` comments | AI Studio |
| `admin` role | Enum + type only |

### 5.5 CI workflow status

- README §CI claims `.github/workflows/ci.yml` runs typecheck, tests, and production build on every push/PR, with placeholder env fallback.
- **The file is not on `main`.** Commit `f774786` (`origin/pilot/phase-b`) deleted it: *“Omit CI workflow from branch until GitHub workflow scope is available.”* Merge of PR #1 therefore shipped **without** CI. `gh run list` is empty.
- Recovered workflow from `8380ffd:.github/workflows/ci.yml` is a reasonable Node 20 `npm ci` / `lint` / `test` / `build` job, but the env lines:

  ```yaml
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL || 'https://placeholder.supabase.co' }}
  ```

  are **invalid GitHub Actions expressions** (`||` inside `${{ }}` does not work that way). Need `secrets.X != '' && secrets.X || 'placeholder'` **or** a step-level fallback. README’s “placeholder if secrets missing” story would not have worked as written.

`PILOT_CHECKLIST.md` / `UI_NOTES.md` already list “CI workflow (`workflow` GitHub scope)” as Phase C. Until that token/permission exists, document the gap; do not claim CI is running.

---

## 6. Product readiness vs `PILOT_CHECKLIST.md` and README deploy notes

### 6.1 Checklist — done (credible)

From `PILOT_CHECKLIST.md` + `UI_NOTES.md` + code:

- [x] PR #1 merged to `main`
- [x] Vercel production, Config env `VITE_SUPABASE_*`
- [x] Landing renders (Legal Navy)
- [x] Production login without demo buttons (`SHOW_DEMO_LOGINS` requires `DEV`)
- [x] Client dashboard, Belgelerim empty state, profile form (`ClientDashboardScreen.tsx`)
- [x] Auth Site URL / Redirect documented for the Vercel origin
- [x] Lawyer list + urgency **UI** (counts depend on `deadlineAt`, which is hollow)
- [x] Desktop/mobile CSS smoke (~390 hamburger, messaging empty state) — **not** real iOS Safari

### 6.2 Partial / blocking for a serious pilot

| Item | State | Blocker? |
| --- | --- | --- |
| Password reset | UI + `resetPasswordForEmail` exist; seed domains may fail MX (`PILOT_CHECKLIST` `[~]`) | Soft — use a mailbox you own |
| iOS Safari keyboard + message input | Explicitly unchecked | Soft for desktop-first testers |
| Seed accounts on real email domains | Still Gmail/Outlook/third-party | Yes, if you keep seeding |
| React Router | Phase C | Soft for 5 testers; hard if you share links |
| Email notifications (new message, rejected doc) | None | Soft for a WhatsApp-backed office; hard if the portal is the only channel |
| i18n beyond landing/header | Phase C | Soft if audience is TR-only |
| Deadline automation | UI only, no column/trigger | **Yes** if you sell “48h / 15 gün” as a feature |
| CI | Documented, not present | Soft for a solo; hard before you take PRs |
| RLS write locks | See §4.2 | **Yes** before any untrusted client |
| RODO policy pages | Checkbox only; footer `#` links | **Yes** for real EU personal data |
| Honest legal identity on Footer/Landing | Placeholders | **Yes** for a public law-firm site |

### 6.3 README deploy notes vs reality

| README claim | Reality |
| --- | --- |
| Set `VITE_SUPABASE_URL` + `ANON_KEY` on the host | Correct; required at **build** time for Vite |
| Demo buttons absent in production | Correct |
| Auth Site URL + Redirect | Documented; must stay in sync if the Vercel URL changes |
| Docker build-args for the same vars | Correct |
| CI workflow on every push/PR | **False on `main`** |
| Migrations applied via MCP/CLI | There is no `config.toml`; apply process is tribal knowledge |
| `npm run seed` is safe to re-run | Users reused; **cases duplicate**; timeline trigger + seed both insert steps |

### 6.4 Feature completeness (pilot loop)

Happy path that **is** implemented:

1. Register (RODO checkbox) → confirm email (Supabase setting dependent) → login  
2. Wizard → `legal_cases` insert → trigger timeline → optional Storage + `case_documents`  
3. Client dashboard / timeline / extra upload  
4. Lawyer list → detail → assign, status, approve/reject (reject also sets case `pending_docs`), internal note, chat  
5. Client sees rejection reason; messaging Realtime  

Missing for a law-office pilot of more than a handful of files:

- Notifications (email or at least in-app besides the reminder list that keys off empty deadlines)
- Case search/pagination (admin loads **all** cases with nested docs/timeline/notes/messages in one query)
- Lawyer-only vs admin (audit who can assign / close)
- Immutable audit log
- Document virus/MIME scan
- Privacy policy, cookie banner (footer pretends they exist)
- Wizard category `danismanlik` exists on the landing grid and in the enum, **not** in the wizard `categories` array

---

## 7. Prioritized backlog (max 10)

Sizes: **S** = one focused change; **M** = a short migration + a few files; **L** = cross-cutting.

### P0 — do before inviting untrusted clients

| # | Item | Why | Size |
| --- | --- | --- | --- |
| 1 | **Lock RLS writes:** prevent `profiles.role` self-update (trigger or revoke column update); `WITH CHECK` so clients can only insert `case_messages.sender_role` matching their role, `case_documents.status = 'pending'`, and cases with `client_id = auth.uid()` plus server-controlled `status`/`urgency` defaults. | Anon key is public; UI guards are not security. This is the difference between a demo and a legal file cabinet. | **M** |
| 2 | **Treat git history as leaked:** rotate every seed/pilot password, revoke sessions, delete unused Auth users, stop seeding the production project. Use mailboxes you own. | Public repo still contains old README passwords and hardcoded `DEMO_PASSWORD` in `8038cca`. `mockData.ts` emails are still in `HEAD`. | **S** (ops) |

### P1 — same sprint if you want a trustworthy pilot

| # | Item | Why | Size |
| --- | --- | --- | --- |
| 3 | **Ship `deadline_at` for real** (column + `compute_case_deadline` from urgency, or staff-editable datetime). Wire progress/timeline updates in the DB, not only `setCases`. | Admin “overdue” widgets and client reminders are currently theater; wizard copy promises 48h/15 days. | **M** |
| 4 | **Storage limits in the bucket** (15 MB, allowed MIME) and call `validateUploadFile` in `App.handleUploadDocument` / timeline. | Comment already claims a Storage policy that does not exist; timeline bypasses client checks. | **S** |
| 5 | **Restore CI** once GitHub `workflow` scope exists: typecheck, `vitest`, `vite build` with a *valid* secret-or-placeholder env. Fix README until then. | Every future PR is unguarded; docs currently lie. | **S** |
| 6 | **RODO minimum:** real privacy/terms routes (even static), footer links, keep the checkbox. Replace Footer KRS/NIP/phone/address with real or “pilot — not a registered entity” copy. | Live domain + EU personal data + fake registry numbers is worse than a staging watermark. | **S–M** |

### P2 — Phase C (product, not fire)

| # | Item | Why | Size |
| --- | --- | --- | --- |
| 7 | **React Router** (or at least query `?case=` + screen path) so refresh/back/share work. Guards stay; RLS stays source of truth. | Already on the Phase C list; hosting SPA fallbacks are ready. | **M** |
| 8 | **Enable `strict` + `supabase gen types`**, delete `as any` in the wizard, type the nested select. | Cheap insurance once RLS is locked; current `tsc` is a weak gate. | **M** |
| 9 | **Delete dead weight:** Cursor notes drawer, designNotes, public theme HTML, `metadata.json` noise. Optionally drop unused `admin` or give it a real permission. | Smaller bundle, fewer “is this wired?” questions. | **S** |
| 10 | **Notifications + seed hygiene:** email (or Edge Function) on new message / rejected doc; make `npm run seed` idempotent (upsert by `case_number`); disable timeline trigger during seed or skip seed timelines. | Portal is silent; re-seed duplicates files. i18n and Safari QA can follow. | **L** |

Out of the top 10 on purpose: full i18n, assigned-lawyer-only RLS, virus scanning, pagination, audit log. Do those after 1–6.

---

## 8. Suggested order of work (solo)

1. Ops: rotate passwords / prune seed users on the hosted Supabase project (item 2).  
2. Migration: RLS column locks (item 1) — test with the anon key in the SQL editor, not only the UI.  
3. Migration: `deadline_at` or strip the badges until it exists (item 3).  
4. Storage MIME/size + timeline validation (item 4).  
5. Footer/legal copy + privacy stub (item 6).  
6. CI file + README honesty (item 5).  
7. Then Phase C (router, types, dead code, notifications).

---

## 9. Files read (evidence)

**Product / deploy:** `README.md`, `PILOT_CHECKLIST.md`, `UI_NOTES.md`, `package.json`, `.env.example`, `.gitignore`, `.dockerignore`, `Dockerfile`, `nginx.conf`, `vercel.json`, `netlify.toml`, `vite.config.ts`, `tsconfig.json`, `index.html`, `metadata.json`

**App shell:** `src/App.tsx`, `src/main.tsx`, `src/types.ts`, `src/vite-env.d.ts`, `src/index.css`

**Views:** `AuthScreen.tsx`, `LandingScreen.tsx`, `ClientDashboardScreen.tsx`, `NewApplicationWizardScreen.tsx`, `CaseTimelineScreen.tsx`, `MessagingScreen.tsx`, `AdminCaseListScreen.tsx`, `AdminCaseDetailScreen.tsx`

**Hooks / lib:** `useAuth.ts`, `useCases.ts`, `useCaseMessages.ts`, `useLawyers.ts`, `useToast.tsx`, `useNowTick.ts`, `supabaseClient.ts`, `storage.ts`, `deadline.ts`, `validation.ts`, `caseMappers.ts`

**UI chrome:** `Header.tsx`, `Footer.tsx`, `DeadlineBadge.tsx`, `CursorNotesDrawer.tsx`

**Data:** `src/data/mockData.ts`, `src/data/designNotes.ts`

**Tests:** `deadline.test.ts`, `validation.test.ts`, `caseMappers.test.ts`

**Schema / seed:** all 10 files under `supabase/migrations/`, `supabase/seed/seed.ts`

**Git / GitHub:** `main` @ `81b41f8`; history `8038cca`, `f774786`, `8380ffd`; PR #1; public repo metadata; empty Actions run list

No application or schema files were modified for this review.
