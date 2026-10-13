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
  ['opening', 'Opening'], ['during', 'During sessions'], ['after', 'After sessions'], ['closing', 'Closing'],
  ['post', 'Posting'], ['week', 'This week'], ['month', 'This month'],
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
    case 1: return { title: 'Story — today’s setup', format: 'Story', pillar: 'Show the space',
      what: 'A photo or 5–10 second clip of the zone booked today, set up and ready (use the “ready” photos from opening).',
      hook: '“Today in T. Nagar: a studio set up and ready for a shoot.”', cta: 'Book your slot — link in bio (add the link sticker).' };
    case 2: return { title: `Reel — ${tip}`, format: 'Reel (15–30 sec)', pillar: 'Make it useful',
      what: `A quick tip from the ${tipZone} zone: ${tip}. Film it on your phone in the zone itself; one idea, no more than 4 shots.`,
      hook: `“${tip}”`, cta: `DM “${tipZone.toUpperCase()}” for rates — then log the DM as an enquiry.` };
    case 4: return { title: `Carousel — ${featZone} zone feature`, format: 'Carousel (5–7 slides)', pillar: 'Show the space + the work',
      what: `Slide 1: the hook. 2–3: the ${featZone} zone from different angles. 4: the gear. 5: what you can shoot here. 6: minimum booking (${MIN_HOURS[featZone]}) and how to book.`,
      hook: `“Inside Chennai’s only 3-in-1 studio: the ${featZone} zone”`, cta: 'Save this for your next shoot · book via the link in bio.' };
    case 5: return { title: 'Story — review spotlight', format: 'Story', pillar: 'Social proof',
      what: 'A screenshot of a recent Google review (crop out nothing — keep the reviewer’s name and stars) on a clean background. Reshare any client tag of us from this week too.',
      hook: '“What our creators say”', cta: 'Read more reviews on Google · book via the link in bio.' };
    case 6: return { title: 'Post — client result or before/after', format: 'Photo or Reel', pillar: 'Show the work',
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

  // Only the numbers that aren't recorded automatically (see DAILY_AUTO) are asked for; none left → no task.
  const manual = [!DAILY_AUTO.instagram && 'Instagram followers', !DAILY_AUTO.google && 'Google reviews'].filter(Boolean);
  if (manual.length) add('opening', 'o_counts', 'Record today’s ' + manual.join(' and '), { counts: true, hint: 'Type the number' + (manual.length > 1 ? 's' : '') + ' exactly as shown right now on the ' + (manual.length > 1 ? 'Instagram profile and the Google Business Profile' : manual[0] === 'Instagram followers' ? 'Instagram profile' : 'Google Business Profile') + '. Do it at about the same time every day so the growth is comparable.' });
  add('opening', 'o_sched', 'Check today’s schedule', { hint: 'Confirm the zone, start time and payment status of every booking.', link: 'login.html', linkLabel: 'Schedule' });
  add('opening', 'o_welcome', 'Send tomorrow’s welcome WhatsApps', { hint: 'The home page shows a reminder card for each client who needs one.', link: 'login.html', linkLabel: 'Home' });
  add('opening', 'o_reset', 'Reset every zone that’s booked today', { hint: 'Podcast: sofas straight, mics wiped, cables tidy. Photography: backdrop clean, floor swept. Kitchen: counters clean, gas and water working, bins empty.' });
  add('opening', 'o_power', 'AC, lights and TV counter on', { hint: 'Check the counter shows the right “Up Next”.' });
  add('opening', 'o_photo', 'Take “ready” photos of each zone', { hint: 'Raw material for stories and Google photos. Use daylight if you can; tidy the frame first.' });

  add('during', 'd_bts', 'Capture 2–3 behind-the-scenes photos or clips', { hint: 'Only with the client’s OK. Wide shots of the setup and the gear in use work best.' });
  add('during', 'd_issues', 'Note any problems', { hint: 'Gear that failed, anything a client complained about, anything that ran short. Log gear problems in Equipment.', link: 'equipment.html', linkLabel: 'Equipment' });

  add('after', 'a_reset', 'Reset each zone after its session', { hint: 'Wipe down what was used and put everything back so the next session starts clean.' });
  add('after', 'a_feedback', 'Send the feedback WhatsApp with the Google review link', { hint: 'To every client whose session ended today. The home page shows a reminder card for each.', link: 'login.html', linkLabel: 'Home' });
  add('after', 'a_payment', 'Record any payment still due', { hint: 'Check each of today’s quotes shows as fully paid.', link: 'quote.html', linkLabel: 'Quotes' });

  add('closing', 'c_leads', 'Lead follow-up', { hint: 'New enquiries: reply within 1 hour in working hours. Quotes sent but unpaid: follow up on day 1, 3 and 7, then mark lost. Past clients: message anyone not heard from in 30 days. Record every outcome.', link: 'pipeline.html', linkLabel: 'Pipeline' });
  add('closing', 'c_reviews', 'Reply to new Google reviews', { hint: 'Within 24 hours, using the words people search for naturally (“Glad our podcast studio worked for you”).', link: 'reviews.html', linkLabel: 'Reviews' });
  add('closing', 'c_equip', 'Log any equipment issues', { hint: 'Anything broken, missing or low on battery goes in the register so the owner is alerted.', link: 'equipment.html', linkLabel: 'Equipment' });
  add('closing', 'c_lock', 'Lock-up', { hint: 'Equipment off, windows shut, kitchen gas off, trash out.' });

  const brief = postingBrief(dow, wk);
  if (brief) add('post', 'p_post', brief.title, { brief });
  else if (dow === 0) add('post', 'p_plan', 'Plan next week’s content', { hint: 'Pick 2 recent sessions to feature, check each client is happy to be posted, and collect the photos and clips. The Monday–Saturday posts use them.' });

  if (dow === 2) {
    const z = ZONES[wk % ZONES.length];
    add('week', 'w_equip', `Equipment check — ${z}`, { hint: 'Test every item in the zone and update its condition. The zone rotates weekly so everything is checked about monthly.', link: 'equipment.html?check=1&zone=' + encodeURIComponent(z), linkLabel: 'Start check' });
  }
  if (dow === 3) add('week', 'w_google', 'Google Business Profile: upload 3–5 photos and publish one update', { hint: 'Recent photos help local ranking. Mix the space, the gear and people at work. Reuse this week’s best Instagram material.' });
  if (dow === 5) add('week', 'w_review', 'Weekly review', { hint: 'Bookings per zone, new Google reviews (aim for 3+ a week), and which posts brought enquiries. Do more of what worked.', link: 'report.html', linkLabel: 'Growth report' });

  if (dom <= 7) {
    add('month', 'm_growth', 'Compare this month’s bookings to target', { hint: 'On the Growth Report.', link: 'report.html', linkLabel: 'Growth report' });
    add('month', 'm_crew', 'Check all crew invoices are entered', { link: 'freelancers.html', linkLabel: 'Crew' });
    add('month', 'm_highlights', 'Update Instagram highlights', { hint: 'Add this month’s best stories to the relevant highlight (Zones, Reviews, Behind the scenes).' });
    add('month', 'm_warranty', 'Review equipment due for service or past warranty', { link: 'equipment.html?filter=due', linkLabel: 'Equipment' });
  }
  return T;
}
const isMonthly = id => id.startsWith('m_');
// What the evening Telegram summary is checked against: everything except monthly tasks.
const plannedFor = iso => tasksFor(iso).filter(t => !isMonthly(t.id)).map(t => ({ id: t.id, label: t.label }));
