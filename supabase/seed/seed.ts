/**
 * One-time QA/dev seed script.
 * Loads INITIAL_CASES from ./fixtures.ts and MOCK_LAWYERS from client mockData
 * into the real Supabase tables (profiles are created via real auth users so RLS behaves
 * exactly like production).
 *
 * Usage:
 *   DEMO_PASSWORD=<local-only> SUPABASE_SERVICE_ROLE_KEY=<service_role_key> npm run seed
 *
 * Get the service role key from: Supabase Dashboard > Project Settings > API.
 * NEVER commit service role / DEMO_PASSWORD or put them in a VITE_-prefixed
 * env var (those are exposed to the browser bundle). VITE_SUPABASE_URL is
 * read from .env.
 *
 * Safe to re-run: existing auth users (matched by email) are reused instead
 * of re-created, but case data will be duplicated if run more than once
 * against a project that already has seeded cases.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MOCK_LAWYERS } from '../../src/data/mockData';
import { INITIAL_CASES } from './fixtures';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DEMO_PASSWORD) {
  console.error(
    'Missing env vars.\nRun as:\n  DEMO_PASSWORD=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed\n' +
      '(VITE_SUPABASE_URL is read from .env — never commit DEMO_PASSWORD or the service role key)'
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// NOTE: Supabase Auth validates that the email domain can actually receive
// mail (MX lookup) even when using the admin API. A fictional company
// domain (e.g. "@polonyadakiavukatim.pl") will be rejected with
// "email_address_invalid" until that domain is registered with real MX
// records. Using real, resolvable domains here keeps the seed script
// working out of the box; swap these once the firm's own domain is live.
const LAWYER_EMAILS: Record<string, string> = {
  'Av. Piotr Kowalski': 'piotr.kowalski.demo@gmail.com',
  'Av. Zeynep Yılmaz Kowalska': 'zeynep.yilmaz.demo@gmail.com',
  'Av. Marek Nowak': 'marek.nowak.demo@gmail.com',
};

const TURKISH_MONTHS: Record<string, string> = {
  Ocak: '01',
  Şubat: '02',
  Mart: '03',
  Nisan: '04',
  Mayıs: '05',
  Haziran: '06',
  Temmuz: '07',
  Ağustos: '08',
  Eylül: '09',
  Ekim: '10',
  Kasım: '11',
  Aralık: '12',
};

function parseTurkishDate(input?: string): string | null {
  if (!input) return null;
  const parts = input.trim().split(' ');
  if (parts.length !== 3) return null;
  const [day, monthName, year] = parts;
  const month = TURKISH_MONTHS[monthName];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function parseTurkishDateTime(input?: string): string | null {
  if (!input) return null;
  const [datePart, timePart] = input.split(' - ');
  const date = parseTurkishDate(datePart);
  if (!date || !timePart) return null;
  return `${date}T${timePart}:00`;
}

async function ensureUser(
  existingUsers: { id: string; email?: string }[],
  email: string,
  fullName: string,
  phone: string,
  role: 'client' | 'lawyer',
  avatarUrl?: string
): Promise<string> {
  const found = existingUsers.find((u) => u.email === email);
  let userId: string;

  if (found) {
    userId = found.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });
    if (error || !data.user) {
      throw new Error(`Failed to create user ${email}: ${error?.message}`);
    }
    userId = data.user.id;
  }

  const updates: Record<string, unknown> = {};
  if (role === 'lawyer') updates.role = 'lawyer';
  if (avatarUrl) updates.avatar_url = avatarUrl;
  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from('profiles').update(updates).eq('id', userId);
    if (error) throw new Error(`Failed to update profile for ${email}: ${error.message}`);
  }

  return userId;
}

async function main() {
  const { data: userList, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listError) throw listError;
  const existingUsers = userList.users.map((u) => ({ id: u.id, email: u.email }));

  console.log('Seeding lawyers...');
  const lawyerIdByName: Record<string, string> = {};
  for (const lawyer of MOCK_LAWYERS) {
    const email = LAWYER_EMAILS[lawyer.name];
    if (!email) continue;
    try {
      const id = await ensureUser(existingUsers, email, lawyer.name, '', 'lawyer', lawyer.avatar);
      lawyerIdByName[lawyer.name] = id;
      console.log(`  ${lawyer.name} -> ${email} (${id})`);
    } catch (err) {
      console.error(`  Failed to seed lawyer ${lawyer.name} (${email}):`, (err as Error).message);
    }
  }

  console.log('Seeding clients...');
  const clientIdByEmail: Record<string, string> = {};
  for (const c of INITIAL_CASES) {
    if (clientIdByEmail[c.clientEmail]) continue;
    try {
      const id = await ensureUser(existingUsers, c.clientEmail, c.clientName, c.clientPhone, 'client');
      clientIdByEmail[c.clientEmail] = id;
      console.log(`  ${c.clientName} -> ${c.clientEmail} (${id})`);
    } catch (err) {
      console.error(`  Failed to seed client ${c.clientName} (${c.clientEmail}):`, (err as Error).message);
    }
  }

  console.log('Seeding cases...');
  for (const c of INITIAL_CASES) {
    if (!clientIdByEmail[c.clientEmail]) {
      console.error(`  Skipping case ${c.caseNumber}: client ${c.clientEmail} was not seeded.`);
      continue;
    }

    const { data: caseRow, error: caseError } = await admin
      .from('legal_cases')
      .insert({
        case_number: c.caseNumber,
        client_id: clientIdByEmail[c.clientEmail],
        case_type: c.caseType,
        case_category: c.caseCategory,
        city: c.city,
        status: c.status,
        urgency: c.urgency,
        assigned_lawyer_id: lawyerIdByName[c.assignedLawyer] ?? null,
        progress_percent: c.progressPercent,
        form_summary: c.formSummary,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      })
      .select('id')
      .single();

    if (caseError || !caseRow) {
      console.error(`  Failed to insert case ${c.caseNumber}:`, caseError?.message);
      continue;
    }

    const caseId = caseRow.id as string;
    console.log(`  ${c.caseNumber} -> ${caseId}`);

    if (c.documents.length) {
      const { error } = await admin.from('case_documents').insert(
        c.documents.map((d) => ({
          case_id: caseId,
          name: d.name,
          size: d.size,
          type: d.type,
          status: d.status,
          rejection_reason: d.rejectionReason ?? null,
          uploaded_at: d.uploadedAt,
        }))
      );
      if (error) console.error(`    documents insert failed: ${error.message}`);
    }

    if (c.timeline.length) {
      const { error } = await admin.from('case_timeline_steps').insert(
        c.timeline.map((t, idx) => ({
          case_id: caseId,
          title: t.title,
          description: t.description,
          step_date: parseTurkishDate(t.date),
          status: t.status,
          actor: t.actor ?? null,
          sort_order: idx,
        }))
      );
      if (error) console.error(`    timeline insert failed: ${error.message}`);
    }

    if (c.internalNotes.length) {
      const { error } = await admin.from('case_internal_notes').insert(
        c.internalNotes.map((n) => ({
          case_id: caseId,
          author_id: lawyerIdByName[n.author] ?? null,
          content: n.content,
          is_private: true,
          created_at: n.date.replace(' ', 'T') + ':00',
        }))
      );
      if (error) console.error(`    internal notes insert failed: ${error.message}`);
    }

    if (c.messages.length) {
      const { error } = await admin.from('case_messages').insert(
        c.messages.map((m) => ({
          case_id: caseId,
          sender_id:
            m.senderRole === 'lawyer' ? lawyerIdByName[c.assignedLawyer] ?? null : clientIdByEmail[c.clientEmail],
          sender_role: m.senderRole,
          body: m.text,
          attachments: m.attachments ?? [],
          created_at: parseTurkishDateTime(m.timestamp) ?? new Date().toISOString(),
        }))
      );
      if (error) console.error(`    messages insert failed: ${error.message}`);
    }
  }

  console.log(`\nDone. Demo login password for all seeded users: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
