# Overlap: guida per andare online

Due parti. Prima la versione web (serve comunque: l'app per iPhone usa lo stesso database), poi l'app per iPhone su TestFlight.
Serve un computer, Mac o Windows. Claude ti guida passo passo.

## Cosa c'è nella cartella

| Parte | A cosa serve |
|---|---|
| `index.html`, `src/` | L'app: calendario, viaggi, amici, inviti, impostazioni, accesso |
| `ios-app/` | L'app per iPhone, che apre Overlap con le notifiche di Apple |
| `supabase/schema.sql` | Database, regole di privacy, ricerca delle sovrapposizioni |
| `supabase/push-cron.sql` | Fa partire le notifiche ogni 2 minuti |
| `api/send.js` | Manda le notifiche ai telefoni |
| `.github/workflows/` | Il pulsante per ricostruire l'app iPhone dopo ogni modifica |
| `KEYS-private.txt` | Chiavi segrete. Solo per te, non caricarle mai |

## Parte 1: la versione web (circa 30 minuti, gratis)

### GitHub
1. Crea un account su github.com
2. Nuovo repository, nome `overlap`, Private
3. Carica tutti i file della cartella tranne `node_modules`, `ios-app/node_modules` e `KEYS-private.txt`

### Supabase
1. Account su supabase.com, accesso con GitHub
2. Nuovo progetto `overlap`, regione Central EU (Zurigo o Francoforte). Salva la password del database
3. SQL Editor > New query > incolla tutto `supabase/schema.sql` > Run
4. Authentication > Email Templates: in **Confirm signup** e **Magic Link** metti come testo `Il tuo codice Overlap è {{ .Token }}` e come oggetto `Il tuo codice Overlap`. Salva
5. Project Settings > API Keys: copia Project URL, la chiave pubblica (anon o publishable) e quella segreta (service_role o secret)

Le email incluse hanno un limite orario basso. Prima di invitare i 10 tester collega un servizio email gratuito (Authentication > SMTP Settings, per esempio Resend).

### Vercel
1. Account su vercel.com, accesso con GitHub
2. Add New > Project > importa `overlap`. Framework: Vite
3. Environment Variables:
   - `VITE_SUPABASE_URL`: Project URL di Supabase
   - `VITE_SUPABASE_ANON_KEY`: chiave pubblica
   - `SUPABASE_SERVICE_ROLE_KEY`: chiave segreta
   - le quattro righe di `KEYS-private.txt`
4. Deploy. Ricevi un indirizzo tipo `overlap-xyz.vercel.app`
5. In Supabase > Authentication > URL Configuration metti quell'indirizzo come Site URL

### Notifiche
1. In `supabase/push-cron.sql` metti il tuo indirizzo Vercel e il `CRON_SECRET`
2. Incollalo in Supabase SQL Editor > Run

## Parte 2: l'app per iPhone su TestFlight

### Account
1. **Apple Developer Program**: developer.apple.com/programs > Enroll, con il tuo Apple ID, come persona (Individual). 99 dollari l'anno. Apple verifica l'identità, di solito in 1 o 2 giorni
2. **Expo**: account gratuito su expo.dev. Costruisce l'app per iPhone nel cloud, senza bisogno di un Mac

### Nome
Su App Store Connect il nome deve essere unico e "Overlap" esiste già. Usa un nome tipo "Overlap Friends". Sotto l'icona del telefono resta scritto Overlap.

### Prima costruzione (una volta, dal computer)
1. Installa Node.js da nodejs.org (versione LTS)
2. In `ios-app/overlap.json` scrivi il tuo indirizzo Vercel in `appUrl`, per esempio `https://overlap-xyz.vercel.app`
3. Apri il Terminale nella cartella `ios-app` e scrivi, uno alla volta:
   - `npm install`
   - `npx eas-cli login` (con il tuo account Expo)
   - `npx eas-cli init` e copia il project ID che ti mostra in `overlap.json` alla voce `projectId`
   - `npx eas-cli build --platform ios --profile production --auto-submit`
4. Ti chiede di accedere con il tuo Apple ID: rispondi sì a tutto, compreso **Push Notifications**. Crea da solo certificati e chiavi
5. Dopo circa 20 minuti l'app arriva su App Store Connect > TestFlight

### Mandare l'app agli amici
1. App Store Connect > la tua app > TestFlight > Test esterni > nuovo gruppo "Amici"
2. Aggiungi la build e compila le info richieste (una descrizione breve e la tua email). Apple fa un controllo, di solito circa un giorno
3. Attiva **Link pubblico** e copialo
4. In Vercel aggiungi `VITE_TESTFLIGHT_URL` con quel link e fai Redeploy. Così chi apre un tuo invito su iPhone viene mandato all'app

### Aggiornamenti
Ogni versione dura 90 giorni. Per una nuova: su GitHub > Settings > Secrets > Actions aggiungi `EXPO_TOKEN` (da expo.dev > Access tokens), poi Actions > Build iPhone app > Run workflow. Ricordati di caricare anche `overlap.json` compilato.

## Controllare il design senza database
`npm install`, poi `npx vite --mode mock` e apri l'indirizzo che compare.
