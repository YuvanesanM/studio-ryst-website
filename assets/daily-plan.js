/* Studio RYST daily coordinator plan — shared by daily-tasks.html (the
   checklist) and dashboard.html (today's progress). Plain globals on purpose:
   both pages load this as a classic script before their own code.
   DAILY_AUTO says which daily counts the server records by itself
   (GET /social-stats → sources); the pages set it before building a plan. */
var DAILY_AUTO = { google: false, instagram: false };

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const isoOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => isoOf(new Date());
const parseISO = iso => new Date(iso + 'T00:00:00');
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoOf(d); };
const fmtLong = iso => parseISO(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
function isoWeekNo(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
}

/* ---------- the plan ---------- */
const GROUPS = [
  ['opening', '☀️ Morning'], ['during', '🎬 During the day'], ['closing', '🌙 Wrap-up'],
  ['post', '📣 Post of the day'], ['week', '📅 This week'], ['month', '🗓 This month'],
];
const ZONES = ['Podcast', 'Photography', 'Kitchen', 'Common / IT'];
const POST_RULES = [
  'Hook in the first line (or first 2 seconds) — say what makes it worth stopping for.',
  'One call to action, e.g. “Book your slot — link in bio” or “DM PODCAST for rates”.',
  'Caption and alt text use the words people search: “podcast studio Chennai”, “kitchen studio Chennai”, “photography studio Chennai”.',
  'Tag the location: Studio RYST, T. Nagar.',
  '3–5 relevant hashtags, not 30.',
  'Get the client’s OK before posting their face, brand or work.',
];
const POST_TIMING = 'Best starting guess for Chennai: evenings (≈ 7–9 pm) or lunchtime. Check Instagram Insights after a month and move the time to whenever your followers are online.';
const TIPS = {
  Podcast: ['3 things to do before your first podcast recording', 'How to sit and speak for cleaner audio', 'Video podcast: what the camera sees vs. what the mic hears'],
  Kitchen: ['How we light a food video in 30 seconds', 'Styling a dish for the camera: 3 quick tricks', 'The 5 shots every cooking video needs'],
  Photography: ['Lighting a product on a plain background', 'Headshot posing: 3 fixes for stiff photos', 'Softbox vs. LED panel: when to use which'],
};
const TIP_ZONES = ['Podcast', 'Kitchen', 'Photography'];
const MIN_HOURS = { Podcast: '2 hours', Photography: '2 hours', Kitchen: '4 hours' };

function postingBrief(dow, wk) {
  const tipZone = TIP_ZONES[wk % 3], tip = TIPS[tipZone][Math.floor(wk / 3) % 3];
  const featZone = TIP_ZONES[(wk + 1) % 3];
  switch (dow) {
    case 1: return { title: '📣 Story: today’s setup', format: 'Story', pillar: 'Show the space',
      what: 'A photo or 5–10 second clip of the zone booked today, set up and ready (use the “ready” photos from opening).',
      hook: '“Today in T. Nagar: a studio set up and ready for a shoot.”', cta: 'Book your slot — link in bio (add the link sticker).' };
    case 2: return { title: `📣 Reel: ${tip}`, format: 'Reel (15–30 sec)', pillar: 'Make it useful',
      what: `A quick tip from the ${tipZone} zone: ${tip}. Film it on your phone in the zone itself; one idea, no more than 4 shots.`,
      hook: `“${tip}”`, cta: `DM “${tipZone.toUpperCase()}” for rates — then log the DM as an enquiry.` };
    case 4: return { title: `📣 Carousel: the ${featZone} zone`, format: 'Carousel (5–7 slides)', pillar: 'Show the space + the work',
      what: `Slide 1: the hook. 2–3: the ${featZone} zone from different angles. 4: the gear. 5: what you can shoot here. 6: minimum booking (${MIN_HOURS[featZone]}) and how to book.`,
      hook: `“Inside Chennai’s only 3-in-1 studio: the ${featZone} zone”`, cta: 'Save this for your next shoot · book via the link in bio.' };
    case 5: return { title: '📣 Story: review spotlight', format: 'Story', pillar: 'Social proof',
      what: 'A screenshot of a recent Google review (crop out nothing — keep the reviewer’s name and stars) on a clean background. Reshare any client tag of us from this week too.',
      hook: '“What our creators say”', cta: 'Read more reviews on Google · book via the link in bio.' };
    case 6: return { title: '📣 Post: a client result', format: 'Photo or Reel', pillar: 'Show the work',
      what: 'A finished client result (episode clip, plated dish, edited photo) or a before/after of a zone reset. Only with the client’s permission; tag them.',
      hook: '“Made at Studio RYST”', cta: 'Your turn — book a session, link in bio.' };
    default: return null;
  }
}

// Every task for a date. Monthly tasks only appear on days 1–7.
function tasksFor(iso) {
  const d = parseISO(iso), dow = d.getDay(), wk = isoWeekNo(d), dom = d.getDate();
  const T = [];
  const add = (group, id, label, extra) => T.push(Object.assign({ group, id, label }, extra || {}));

  // Short, friendly list — the how-to lives in each task's hint (tap to open).
  add('opening', 'o_sched', '📅 Check today’s bookings', { hint: 'Zone, start time and payment for every session today.', link: 'login.html?view=schedule', linkLabel: 'Schedule' });
  add('opening', 'o_ready', '✨ Get the studio ready', { hint: 'Reset the zones booked today — sofas straight, mics wiped, backdrop clean, kitchen counters clear — then AC, lights and the TV counter on.' });
  add('opening', 'o_welcome', '👋 Send tomorrow’s welcomes', { hint: 'One WhatsApp for each client booked tomorrow. The Schedule page has a button for each.', link: 'login.html?view=schedule', linkLabel: 'Schedule' });
  // Only the numbers that aren't recorded automatically (see DAILY_AUTO) are asked for; none left → no task.
  const manual = [!DAILY_AUTO.instagram && 'Instagram followers', !DAILY_AUTO.google && 'Google reviews'].filter(Boolean);
  if (manual.length) add('opening', 'o_counts', '📈 Log today’s ' + manual.join(' & '), { counts: true, hint: 'Type the number' + (manual.length > 1 ? 's' : '') + ' exactly as shown right now. Same time each day keeps the growth chart honest.' });

  add('during', 'o_photo', '📸 Snap photos & clips for socials', { hint: '“Ready” shots of each zone, plus 2–3 behind-the-scenes clips during sessions — only with the client’s OK.' });
  add('during', 'a_feedback', '⭐ Ask today’s clients for a review', { hint: 'Send the feedback WhatsApp once a session ends. The Schedule page has a button for each.', link: 'login.html?view=schedule', linkLabel: 'Schedule' });
  add('during', 'a_payment', '💰 Collect what’s due', { hint: 'Every session today should end fully paid. Record payments on the quote.', link: 'quote.html', linkLabel: 'Quotes' });
  add('during', 'c_leads', '📞 Follow up leads', { hint: 'Reply to new enquiries within an hour. Nudge unpaid quotes on day 1, 3 and 7, then mark them lost.', link: 'pipeline.html', linkLabel: 'Pipeline' });

  add('closing', 'c_reviews', '💬 Reply to new Google reviews', { hint: 'A quick thank-you that mentions the studio naturally (“Glad our podcast studio worked for you”).', link: 'reviews.html', linkLabel: 'Reviews' });
  add('closing', 'c_issues', '🛠 Report anything broken', { hint: 'Gear that failed or anything that ran short — log it in Equipment and the owner gets a ping.', link: 'equipment.html', linkLabel: 'Equipment' });
  add('closing', 'c_lock', '🔒 Reset & lock up', { hint: 'Zones tidy for tomorrow, equipment off, windows shut, kitchen gas off, trash out.' });

  const brief = postingBrief(dow, wk);
  if (brief) add('post', 'p_post', brief.title, { brief });
  else if (dow === 0) add('post', 'p_plan', '🗒 Plan next week’s posts', { hint: 'Pick 2 recent sessions to feature, check each client is happy to be posted, and collect the photos and clips.' });

  if (dow === 2) {
    const z = ZONES[wk % ZONES.length];
    add('week', 'w_equip', `🔧 Equipment check — ${z}`, { hint: 'Test every item in the zone and update its condition. The zone rotates weekly, so everything gets checked about once a month.', link: 'equipment.html?check=1&zone=' + encodeURIComponent(z), linkLabel: 'Start check' });
  }
  if (dow === 3) add('week', 'w_google', '🗺 Google: add 3–5 photos + 1 update', { hint: 'Fresh photos help local ranking. Reuse this week’s best Instagram shots.' });
  if (dow === 5) add('week', 'w_review', '📊 Weekly review', { hint: 'Bookings per zone, new Google reviews (aim for 3+), and which posts brought enquiries.', link: 'report.html', linkLabel: 'Growth report' });

  if (dom <= 7) {
    add('month', 'm_growth', '🎯 Bookings vs target', { link: 'report.html', linkLabel: 'Growth report' });
    add('month', 'm_crew', '🧾 All crew invoices entered?', { link: 'freelancers.html', linkLabel: 'Crew' });
    add('month', 'm_highlights', '✨ Refresh Instagram highlights', { hint: 'Add this month’s best stories to the right highlight (Zones, Reviews, Behind the scenes).' });
    add('month', 'm_warranty', '🛡 Warranty & service check', { link: 'equipment.html?filter=due', linkLabel: 'Equipment' });
  }
  return T;
}
const isMonthly = id => id.startsWith('m_');
// What the evening Telegram summary is checked against: everything except monthly tasks.
const plannedFor = iso => tasksFor(iso).filter(t => !isMonthly(t.id)).map(t => ({ id: t.id, label: t.label }));
