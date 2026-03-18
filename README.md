# Pelėdnagių 2x2 lyga

Draugų krepšinio turnyro svetainė su juoda/oranžine tema.

## Paleidimas

```bash
npm install
npm run dev
```

Svetainė: http://localhost:3000

## Aplinkos kintamieji

Reikalingi `.env.local` arba Vercel projekto nustatymuose:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
SITE_PASSWORD=...
SITE_SESSION_SECRET=...
```

Pastabos:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` naudojamas viešiems skaitymo užklausoms.
- `SUPABASE_SERVICE_ROLE_KEY` naudojamas tik serverio pusėje administravimo veiksmams.
- `ADMIN_SESSION_SECRET` ir `SITE_SESSION_SECRET` turi būti ilgos atsitiktinės reikšmės.

## Puslapiai

- `/` – Pradžia su komandų sąrašu
- `/standings` – Turnyrinė lentelė
- `/schedule` – Rungtynės (30 rungtynių – 3 ratai, kiekviename rate visos komandos sužaidžia tarpusavyje po kartą)
- `/players` – Žaidėjų sąrašas
- `/wagers` – Lažybos
- `/admin` – Administravimas

## Komandos ir žaidėjai

1. **Traktorių žibintai**: Kajus Jančauskas, Skirmantas Žukas
2. **Neblaivūs už vairo**: Augustas Kapočius, Augustas Galinaitis
3. **Malūnsnarglis**: Redas Jankauskas, Žygimantas Aleksandravičius
4. **Pride police**: Simonas Bagdonas, Vakaris Janeliūnas
5. **Geeks in sneaks**: Vilius Tubilevičius, Robertas Černeckis

## Administravimas

Slaptažodis `.env.local` faile:
```
ADMIN_PASSWORD=AugisBaugis123
```

Admin funkcijos:
- Pridėti/redaguoti/trinti rungtynes
- Įvesti rezultatus
- Kurti lažybas su koeficientais

## Lažybos

- Administratorius kuria lažybas su koeficientais
- Lankytojai gali statyti už komandas
- Statymai rodomi realiu laiku

## Technologijos

- Next.js 16
- TypeScript
- Tailwind CSS
- JSON failai duomenims
