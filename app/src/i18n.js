/* Languages: the app is written in English; Italian is applied on top, by swapping the words on screen.
   The choice is kept on this phone (Settings, Language). */
let saved = '';
try { saved = localStorage.getItem('ov-lang') || ''; } catch (e) {}
export const LANG = saved || ((navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en');
export function setLang(l) { try { localStorage.setItem('ov-lang', l); } catch (e) {} location.reload(); }
export const LANGS = [['en', 'English'], ['it', 'Italiano']];

const IT = {
  'About Overlap': 'Cos’è Overlap', 'Accept': 'Accetta', 'Add Overlap to your Home Screen': 'Aggiungi Overlap alla schermata Home',
  'Add a city.': 'Aggiungi una città.', 'Add a trip from this day': 'Aggiungi un viaggio da questo giorno', 'Add all': 'Aggiungi tutti',
  'Add friend': 'Aggiungi amico', 'Add the city where you live.': 'Aggiungi la città dove vivi.', 'Add to my calendar': 'Aggiungi al mio calendario',
  'Add trip': 'Aggiungi viaggio', 'Add where you’ll be: your home city, and the trips you plan. Your friends do the same.': 'Aggiungi dove sarai: la città dove vivi e i viaggi che hai in programma. I tuoi amici fanno lo stesso.',
  'Add your WhatsApp number, so friends can message you.': 'Aggiungi il tuo numero WhatsApp, così gli amici possono scriverti.',
  'Add your name, so friends know who you are.': 'Aggiungi il tuo nome, così gli amici sanno chi sei.', 'Add your name.': 'Aggiungi il tuo nome.',
  'Added to your calendar': 'Aggiunto al tuo calendario', 'Alerts are blocked in your phone settings': 'Le notifiche sono bloccate nelle impostazioni del telefono',
  'Alerts off': 'Notifiche spente', 'Alerts on': 'Notifiche accese', 'All': 'Tutti', 'Almost there': 'Ci siamo quasi', 'Are you sure?': 'Sei sicura?',
  'Bring friends': 'Porta amici', 'Calendar': 'Calendario', 'Change': 'Cambia', 'Change home city': 'Cambia città di casa',
  'Change photo': 'Cambia foto', 'Add a photo': 'Aggiungi una foto', 'Check the email address.': 'Controlla l’indirizzo email.',
  'Check your connection and try again.': 'Controlla la connessione e riprova.', 'Check your email': 'Controlla la tua email', 'Check your email address.': 'Controlla il tuo indirizzo email.',
  'Clear': 'Cancella', 'Close': 'Chiudi', 'Code': 'Codice', 'Colours': 'Colori', 'Come back to the same link and tap Install': 'Torna allo stesso link e tocca Installa',
  'Coming up': 'In arrivo', 'Continue in the browser instead': 'Continua nel browser', 'Copied ✓': 'Copiato ✓',
  'Copy it and paste it into any chat, for friends who are not on Overlap.': 'Copialo e incollalo in qualsiasi chat, per gli amici che non sono su Overlap.',
  'Copy link': 'Copia link', 'Copy text': 'Copia testo', 'Could not accept, try again.': 'Non riesco ad accettare, riprova.', 'Could not answer, try again.': 'Non riesco a rispondere, riprova.',
  'Could not delete, try again.': 'Non riesco a eliminare, riprova.', 'Could not load Overlap': 'Non riesco a caricare Overlap', 'Could not remove it, try again.': 'Non riesco a toglierla, riprova.',
  'Could not remove, try again.': 'Non riesco a togliere, riprova.', 'Could not save the photo, try again.': 'Non riesco a salvare la foto, riprova.',
  'Could not save. Check your connection.': 'Non riesco a salvare. Controlla la connessione.', 'Could not send that request.': 'Non riesco a mandare la richiesta.',
  'Could not send that. Try again.': 'Non riesco a mandarlo. Riprova.', 'Could not tell your city. Tap one instead.': 'Non capisco la tua città. Toccane una.',
  'Could not turn on alerts, try again.': 'Non riesco ad accendere le notifiche, riprova.', 'Could not read your calendar.': 'Non riesco a leggere il tuo calendario.',
  'Delete my account': 'Elimina il mio account', 'Deleting…': 'Elimino…', 'Done': 'Fatto', 'Edit': 'Modifica',
  'Faster, and it tells you when you overlap': 'Più veloce, e ti avvisa quando vi incrociate', 'Find and add a friend': 'Trova e aggiungi un amico',
  'Find my trips': 'Trova i miei viaggi', 'Finding…': 'Cerco…', 'Friend added': 'Amico aggiunto', 'Friends': 'Amici', 'Get Overlap': 'Scarica Overlap', 'Get it': 'Scarica',
  'Get the Overlap app': 'Scarica l’app Overlap', 'Get told when you overlap': 'Fatti avvisare quando vi incrociate', 'Google Calendar, one trip at a time:': 'Google Calendar, un viaggio alla volta:',
  'Got it': 'Capito', 'Highlighted means you are there too': 'Evidenziato vuol dire che ci sei anche tu', 'Invite a friend': 'Invita un amico', 'Join': 'Partecipa',
  'Just this day': 'Solo questo giorno', 'Loading…': 'Carico…', 'Location is not available here. Tap a city instead.': 'Qui la posizione non è disponibile. Tocca una città.',
  'Location is off for Overlap. Tap a city instead.': 'La posizione è spenta per Overlap. Tocca una città.', 'Log in or sign up': 'Accedi o registrati',
  'Looking for trips in your calendar…': 'Cerco viaggi nel tuo calendario…', 'Made with love by Bianca.': 'Fatto con amore da Bianca.',
  'My calendar': 'Il mio calendario', 'New code sent. Check your email': 'Nuovo codice inviato. Controlla la tua email', 'Next': 'Avanti', 'Next month': 'Mese dopo',
  'No dates found. Try "London 2-4 Dec".': 'Nessuna data trovata. Prova "Londra 2-4 dic".', 'No friend or city matches that.': 'Nessun amico o città corrisponde.',
  'No friends here yet': 'Ancora nessun amico qui', 'No friends yet. Invite one from the Friends tab.': 'Ancora nessun amico. Invitane uno dalla pagina Amici.',
  'No overlaps yet': 'Ancora nessun incrocio', 'No password. We email you a code.': 'Niente password. Ti mandiamo un codice via email.', 'No, keep it': 'No, tienilo',
  'Nobody found. Invite them below.': 'Nessuno trovato. Invitali qui sotto.', 'Nobody has shared plans for this day.': 'Nessuno ha condiviso piani per questo giorno.',
  'Not now': 'Non ora', 'Not on your calendar': 'Non nel tuo calendario', 'Note (optional)': 'Nota (facoltativa)', 'Only friends you accept see your plans.': 'Solo gli amici che accetti vedono i tuoi piani.',
  'Only friends you accept see your plans. Trips marked Private are only for you.': 'Solo gli amici che accetti vedono i tuoi piani. I viaggi privati sono solo per te.',
  'Open Overlap from its icon': 'Apri Overlap dalla sua icona', 'Or add them by email': 'Oppure aggiungili via email', 'Or tell them your username': 'Oppure digli il tuo username',
  'Overlap alerts': 'Notifiche di Overlap', 'Overlap shows when you and your friends are in the same place.': 'Overlap ti mostra quando tu e i tuoi amici siete nello stesso posto.',
  'Overlap shows when friends will be in the same city as you. Only friends you accept see your plans.': 'Overlap ti mostra quando gli amici saranno nella tua stessa città. Solo gli amici che accetti vedono i tuoi piani.',
  'Overlaps': 'Incroci', 'Paste or type your trips, one per line. For example:': 'Incolla o scrivi i tuoi viaggi, uno per riga. Per esempio:',
  'People on Overlap': 'Persone su Overlap', 'People whose plans you can see show up here, with where they are and where they are going next.': 'Qui compaiono le persone di cui vedi i piani, con dove sono e dove vanno dopo.',
  'Photo removed': 'Foto tolta', 'Photo saved': 'Foto salvata', 'Pick a username: 3 to 20 letters, numbers, dots or underscores.': 'Scegli un username: da 3 a 20 lettere, numeri, punti o trattini bassi.',
  'Previous month': 'Mese prima', 'Private': 'Privato', 'Remove photo': 'Togli foto', 'Remove this trip': 'Elimina questo viaggio',
  'Request sent. They see it when they sign in.': 'Richiesta inviata. La vedrà quando entra.', 'Requested': 'Richiesto', 'Run the database update first (sql.html).': 'Prima fai l’aggiornamento del database (sql.html).',
  'Save': 'Salva', 'Save changes': 'Salva modifiche', 'Search friends, names or @username': 'Cerca amici, nomi o @username', 'Search will work after the last database update.': 'La ricerca funzionerà dopo l’ultimo aggiornamento del database.',
  'Searching…': 'Cerco…', 'See city ▾': 'Vedi città ▾', 'See friend ▾': 'Vedi amico ▾', 'See their plans': 'Vedi i loro piani', 'See when friends overlap': 'Scopri quando incroci gli amici',
  'Select the text above and copy': 'Seleziona il testo sopra e copia', 'Select the text and copy': 'Seleziona il testo e copia', 'Send me a code': 'Mandami un codice', 'Send me a new code': 'Mandami un nuovo codice',
  'Send request': 'Manda richiesta', 'Send with…': 'Invia con…', 'Sending…': 'Invio…', 'Set my home city': 'Imposta la mia città', 'Share': 'Condividi', 'Share my plans': 'Condividi i miei piani',
  'Share this trip': 'Condividi questo viaggio', 'Share where you will be, and find out when friends are in the same city as you.': 'Condividi dove sarai e scopri quando gli amici sono nella tua stessa città.',
  'Sign in': 'Entra', 'Sign out': 'Esci', 'So it opens like an app and can tell you when you overlap.': 'Così si apre come un’app e può avvisarti quando vi incrociate.',
  'Sorry for the extra step: we just need to check it’s really your email, to keep your plans private.': 'Scusa il passaggio in più: dobbiamo solo controllare che sia davvero la tua email, per tenere privati i tuoi piani.',
  'Start': 'Inizia', 'Start with where you live': 'Inizia da dove vivi', 'Switched off': 'Spento', 'Tap Add, then open Overlap from its icon': 'Tocca Aggiungi, poi apri Overlap dalla sua icona',
  'Tap the day you arrive in the calendar.': 'Tocca nel calendario il giorno in cui arrivi.', 'Tap the day you arrive, then your last day': 'Tocca il giorno in cui arrivi, poi l’ultimo giorno',
  'Tap the ones to add.': 'Tocca quelli da aggiungere.', 'That code did not work. Check it, or tap “Send me a new code” below.': 'Quel codice non funziona. Controllalo, o tocca “Mandami un nuovo codice” qui sotto.',
  'The last day is before the first one.': 'L’ultimo giorno è prima del primo.', 'Then open Overlap from its icon. Alerts only work from there.': 'Poi apri Overlap dalla sua icona. Le notifiche funzionano solo da lì.',
  'This deletes your account, your trips and your friends on Overlap. It cannot be undone.': 'Questo elimina il tuo account, i tuoi viaggi e i tuoi amici su Overlap. Non si può annullare.',
  'Today': 'Oggi', 'Trips added': 'Viaggi aggiunti', 'Try again': 'Riprova', 'Turn off': 'Spegni', 'Turn on': 'Accendi', 'Type the code from the email.': 'Scrivi il codice dell’email.',
  'Type your city or tap one above.': 'Scrivi la tua città o toccane una sopra.', 'Uploading photo…': 'Carico la foto…', 'Use a different email': 'Usa un’altra email',
  'Use it in the browser instead': 'Usalo nel browser', 'Username': 'Username', 'Visible only to me': 'Visibile solo a me', 'Wait a minute, then try again.': 'Aspetta un minuto e riprova.',
  'Welcome to Overlap': 'Benvenuta su Overlap', 'WhatsApp number': 'Numero WhatsApp', 'Where you live': 'Dove vivi', 'Where?': 'Dove?', 'Yes, delete my account': 'Sì, elimina il mio account',
  'You': 'Tu', 'Your city': 'La tua città', 'Your email': 'La tua email', 'Your invite link': 'Il tuo link di invito', 'Your name': 'Il tuo nome', 'Your plans as text': 'I tuoi piani come testo',
  'Your settings': 'Impostazioni', 'When are you away?': 'Quando sei via?', 'Edit your trip': 'Modifica il viaggio', 'Add to my calendar ': 'Aggiungi al mio calendario',
  '📅 Apple Calendar, all trips': '📅 Apple Calendar, tutti i viaggi', '📅 From my calendar': '📅 Dal mio calendario', '📋 Paste plans': '📋 Incolla piani', '📍 Use my location': '📍 Usa la mia posizione',
  '📍 Finding you…': '📍 Ti cerco…', '💛 Next overlap': '💛 Prossimo incrocio', 'Add to my calendar': 'Aggiungi al mio calendario', 'they get an invite to add it to their calendar': 'ricevono un invito per aggiungerlo al loro calendario',
  'One alert when a friend will be in your city': 'Un avviso quando un amico sarà nella tua città', 'Add Overlap to your Home Screen to turn on alerts': 'Aggiungi Overlap alla schermata Home per accendere le notifiche',
  'Full calendar': 'Tutto l’anno', 'Previous year': 'Anno prima', 'Next year': 'Anno dopo',
  'Block': 'Blocca', 'Report': 'Segnala', 'Blocked': 'Bloccato', 'What happened? (optional)': 'Cos’è successo? (facoltativo)',
  'We look at every report. Reporting also blocks them.': 'Leggiamo ogni segnalazione. Segnalare blocca anche la persona.', 'Send report and block': 'Segnala e blocca',
  'Thanks, we got your report': 'Grazie, abbiamo ricevuto la segnalazione', 'Privacy': 'Privacy', 'Help and contact': 'Aiuto e contatti', 'Test account': 'Account di prova', 'Password': 'Password',
  'That password did not work.': 'Password sbagliata.',
  'Not set': 'Non impostato', 'You show up here every day. Add a trip whenever you travel and it takes over for those days.': 'Compari qui ogni giorno. Aggiungi un viaggio quando parti e prende il posto di quei giorni.',
  'Get started': 'Per iniziare', 'Set where you live': 'Imposta dove vivi', 'Add your first trip': 'Aggiungi il tuo primo viaggio', 'Got it': 'Capito',
  'Who sees it': 'Chi lo vede', '👥 All friends': '👥 Tutti gli amici', '⭐ Close friends': '⭐ Amici stretti', '🔒 Only me': '🔒 Solo io',
  '⭐ Close friend': '⭐ Amico stretto', 'Sees your trips for close friends': 'Vede i tuoi viaggi per amici stretti', 'Added to close friends': 'Aggiunto agli amici stretti', 'Removed from close friends': 'Tolto dagli amici stretti',
  'Let’s meet?': 'Vediamoci?', 'Which day?': 'Che giorno?', 'Where or when? (optional)': 'Dove o a che ora? (facoltativo)', 'Aperitivo at 7?': 'Aperitivo alle 7?', 'See you there 🥂': 'Ci vediamo lì 🥂', 'Answered': 'Risposto', 'Yes': 'Sì', 'No': 'No',
  'Could not send. Run the database update (sql.html).': 'Non riesco a mandarlo. Fai l’aggiornamento del database (sql.html).',
  '💛 Yellow': '💛 Giallo', '= you and a friend in the same place.': '= tu e un amico nello stesso posto.', 'Pink': 'Rosa', '= your own trips.': '= i tuoi viaggi.',
  'Only your friends see it': 'La vedono solo i tuoi amici',
  'Add your photo': 'Aggiungi la tua foto', 'Calendar': 'Calendario', 'Add trip': 'Aggiungi viaggio',
  'Show on the calendar': 'Cosa vedere nel calendario', 'Everyone': 'Tutti', 'All your friends and you': 'Tutti i tuoi amici e te', 'Just me': 'Solo io', 'Only your own trips': 'Solo i tuoi viaggi', 'A city ›': 'Una città ›', 'Who will be in one city': 'Chi sarà in una città', 'A friend ›': 'Un amico ›', 'Only one friend’s plans': 'Solo i piani di un amico', 'Show everyone': 'Mostra tutti',
  'To add a photo, first update Overlap: open TestFlight and tap Update.': 'Per aggiungere una foto, prima aggiorna Overlap: apri TestFlight e tocca Aggiorna.',
  'Language': 'Lingua', 'with you': 'con te', 'WhatsApp': 'WhatsApp', 'Invite sent': 'Invito inviato', 'Invites sent': 'Inviti inviati', 'joined': 'partecipa', 'invited': 'invitato', 'not now': 'non ora',
  'Add to my calendar.': 'Aggiungi al mio calendario.', 'Your trips': 'I tuoi viaggi', 'Private trip': 'Viaggio privato', 'Pick chat': 'Scrivi',
  'Overlap reads nothing until you tap "From my calendar".': 'Overlap non legge niente finché non tocchi "Dal mio calendario".',
  'Overlap can’t see your calendar. You can allow it in iPhone Settings, Overlap, Calendars.': 'Overlap non vede il tuo calendario. Puoi permetterlo in Impostazioni iPhone, Overlap, Calendari.',
  'When two of you are in the same city on the same days, or close by, Overlap tells you. Then you can send a message and meet.': 'Quando due di voi sono nella stessa città negli stessi giorni, o vicini, Overlap ve lo dice. Così potete scrivervi e vedervi.',
  'Only friends you accept see your plans. Trips marked Private are only for you.​': '',
};
const PAT = [
  [/^👥 Everyone$/, '👥 Tutti'],
  [/^🙋 Just me$/, '🙋 Solo io'],
  [/^Could not save the photo: (.+)$/, 'Non riesco a salvare la foto: $1'],
  [/^(.+): let’s meet in (.+)\?$/, '$1: vediamoci a $2?'],
  [/^Meeting (.+) in (.+)$/, '🥂 Vedi $1 a $2'],
  [/^Waiting for (.+) to answer$/, 'Aspetti la risposta di $1'],
  [/^(.+) asked to meet in (.+)$/, '$1 ti ha chiesto di vedervi a $2'],
  [/^Send to (.+)$/, 'Manda a $1'],
  [/^Sent to (.+)$/, 'Mandato a $1'],
  [/^(.+) wants to share plans with you$/, '$1 vuole condividere i piani con te'],
  [/^(.+) invites you to (.+)$/, '$1 ti invita a $2'],
  [/^You and (.+) are both in (.+)$/, 'Tu e $1 siete entrambi a $2'],
  [/^You and (.+) in (.+)$/, 'Tu e $1 a $2'],
  [/^(.+) is in (.+), (\d+) km from you$/, '$1 è a $2, a $3 km da te'],
  [/^(.+) in (.+), (\d+) km from you$/, '$1 a $2, a $3 km da te'],
  [/^At home in (.+), next (.+) from (.+)$/, 'A casa a $1, poi $2 dal $3'],
  [/^At home in (.+)$/, 'A casa a $1'],
  [/^Coming up in (.+)$/, 'In arrivo a $1'],
  [/^Stop sharing with (.+)$/, 'Smetti di condividere con $1'],
  [/^Hide (.+) from my calendar$/, 'Nascondi $1 dal mio calendario'],
  [/^Show (.+) again$/, 'Mostra di nuovo $1'],
  [/^You on (.+)$/, 'Tu il $1'],
  [/^You are at home in (.+) this day\.$/, 'Questo giorno sei a casa a $1.'],
  [/^Tap again to block (.+)$/, 'Tocca di nuovo per bloccare $1'],
  [/^Next overlap with (.+)$/, 'Prossimo incrocio con $1'],
  [/^Tap again to stop sharing with (.+)$/, 'Tocca di nuovo per smettere di condividere con $1'],
];
const PART = [
  [/ · in (\d+) days?/g, (m, n) => ' · tra ' + n + (n === '1' ? ' giorno' : ' giorni')],
  [/ · now/g, ' · adesso'],
  [/ · 📍 (\d+) km from you/g, ' · 📍 a $1 km da te'],
  [/, with you\b/g, ', con te'],
  [/, in your city\b/g, ', nella tua città'],
  [/ to /g, '–'],
];
function tr(t) {
  const k = t.trim();
  if (!k || /^[\d\s\-–+·.,:/]*$/.test(k)) return null;
  if (IT[k] !== undefined && IT[k] !== '') return t.replace(k, IT[k]);
  for (const [re, to] of PAT) if (re.test(k)) return t.replace(k, k.replace(re, to).replace(/ to /g, '–'));
  let o = k;
  for (const [re, to] of PART) o = o.replace(re, to);
  return o !== k ? t.replace(k, o) : null;
}
function walk(root) {
  if (root.nodeType === 3) { const n = tr(root.nodeValue); if (n !== null && n !== root.nodeValue) root.nodeValue = n; return; }
  if (root.nodeType !== 1 || root.tagName === 'SCRIPT' || root.tagName === 'STYLE' || root.tagName === 'TEXTAREA') return;
  for (const a of ['placeholder', 'aria-label', 'title']) {
    const v = root.getAttribute && root.getAttribute(a);
    if (v) { const n = tr(v); if (n !== null && n !== v) root.setAttribute(a, n); }
  }
  if (root.classList && (root.classList.contains('ptxv') || root.classList.contains('notr'))) return;
  for (let c = root.firstChild; c; c = c.nextSibling) walk(c);
}
export function startI18n() {
  if (LANG !== 'it') return;
  document.documentElement.lang = 'it';
  walk(document.body);
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'characterData') walk(m.target);
      else if (m.type === 'attributes') walk(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
}
