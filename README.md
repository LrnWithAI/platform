# Webová aplikácia - Univerzálne prostredie pre testovanie a zdokonaľovanie vedomostí študentov pomocou AI

Tento projekt je výsledkom bakalárskej práce na FEI TUKE. Naším cieľom bolo vytvoriť **responzívnu webovú aplikáciu** na podporu efektívneho vzdelávania študentov a učiteľov, s dôrazom na jednoduchosť používania a využitie moderných technológií vrátane umelej inteligencie.

---

## Hlavné vlastnosti

- **Vytváranie a správa poznámok** – manuálne zadanie alebo automatizované generovanie obsahu pomocou AI (OpenAI API).
- **Triedy (Classes)** – pedagógovia môžu zakladať a spravovať triedy, pozývať ďalších učiteľov aj študentov, zdieľať materiály, komunikovať cez nástenku a pripojené súbory.
- **Verejný profil používateľa** – každý používateľ (študent alebo pedagóg) si môže nastaviť a zdieľať verejný profil s kontaktnými údajmi, súbormi a dôležitými informáciami.
- **Testy a flashcards (kartičky)** – rýchle vytváranie testov a študijných kartičiek (funkcionalita súčasťou projektu, detailné spracovanie v rámci spoločného repozitára).
- **AI integrácia** – generovanie poznámok, sumarizácia PDF dokumentov alebo automatizované vytváranie študijných materiálov s využitím OpenAI GPT-4.
- **Viacjazyčná podpora** – rýchly preklad rozhrania cez Google Translate.
- **Responzívny dizajn** – aplikácia funguje na mobiloch, tabletoch aj desktopoch.
- **Dark mode / Light mode** – možnosť prepínania medzi svetlým, tmavým a systémovým režimom.
- **Export poznámok do PDF** – jednoducho zdieľateľné poznámky v PDF formáte.
- **Bezpečná autentifikácia cez email** – registrácia, login, obnova hesla (Supabase Auth).
- **Verejné zdieľanie poznámok a materiálov** – niektoré poznámky je možné nastaviť ako verejné a zdieľať ich s ostatnými používateľmi aj návštevníkmi bez účtu.

---

## Použité technológie

- **Next.js** (fullstack framework)
- **TypeScript** (typová bezpečnosť)
- **Tailwind CSS** + **Shadcn UI** (moderné UI)
- **Supabase** (databáza, storage, autentifikácia)
- **OpenAI API** (generovanie obsahu, AI asistent)
- **React Hook Form, Zod, Zustand** (správa formulárov, validácia, stav aplikácie)
- **Vercel** (nasadenie)
- **Lucide Icons** (práca s ikonami)
- **pdfjs-dist** (práca s PDF)

---

## Stručný popis architektúry

- Frontend aj backend je implementovaný v rámci Next.js, všetko v jednom repozitári.
- Supabase slúži ako backendová databáza, autentifikácia a storage.
- Volanie OpenAI API je riešené server-side.
- Stav aplikácie (prihlásenie, triedy, poznámky) sa spravuje cez Zustand.
- Každý používateľ má vlastnú knižnicu poznámok, tried, testov a kartičiek.
- Pedagógovia majú navyše správu tried a násteniek.

---

## Ako spustiť projekt (lokálne)

1. **Klonuj repozitár**
    ```bash
    git clone <repo-url>
    cd <repo-folder>
    ```

2. **Nainštaluj závislosti**
    ```bash
    npm install
    ```

3. **Vytvor `.env.local` súbor** a doplň tieto premenné:
    ```
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    NEXT_PUBLIC_BASE_URL=...
    NEXT_PUBLIC_UPDATE_PASSWORD_URL=...
    OPENAI_API_KEY=...
    ```

    > Prístupové údaje získaš po vytvorení projektu v [Supabase](https://supabase.com/) a v [OpenAI](https://platform.openai.com/)

4. **Spusť vývojový server**
    ```bash
    npm run dev
    ```
    Otvor [http://localhost:3000](http://localhost:3000) v prehliadači.

---

## Deploy

Projekt je optimalizovaný pre [Vercel](https://vercel.com/), kde stačí prepojiť GitHub repozitár a všetko sa deployne automaticky. V produkcii nastav environmentálne premenné priamo vo Vercel dashboarde.

---

## Práva a bezpečnosť

- Prístupy k dátam a súborom sú riadené na základe roly používateľa (študent, pedagóg).
- Súbory sú ukladané štruktúrovane (do zložiek podľa ID používateľa).
- Citlivé údaje (API kľúče) nesmú byť zverejnené vo verejnom repozitári.

---

## Autori

- Miroslav Hanisko
- Matej Bendík
- Konzultant: doc. Ing. Eva Chovancová, PhD.
- Školiteľ: doc. Ing. Martin Chovanec, PhD.

---

Projekt vznikol na akademické účely.

