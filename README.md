# Pelėdnagių 2x2 lyga

Draugų krepšinio turnyro svetainė su juoda/oranžine tema.

## Paleidimas

```bash
npm install
npm run dev
```

Svetainė: http://localhost:3000

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
