# Khan Property Services — website

Static marketing site for **Khan Property Services**, a property services company offering planned maintenance, repairs, renovation and refurbishment, turnovers and make-ready, pre-sale and pre-let preparation, and exterior and building upkeep for homeowners, landlords, property managers and owners of small commercial premises in Virginia and Florida.

Plain HTML, one stylesheet and one small vanilla JavaScript file. No framework, no build step, no icon font. It can be hosted as-is on GitHub Pages or any static host.

## Brand in brief

- **Positioning:** one accountable team for the whole life of a property — a single point of contact, a written scope before work begins, updates on an agreed schedule and a photo-documented completion report.
- **Tagline:** "One accountable team for the whole life of your property."
- **Voice:** assured, organized, calm. Leads with what the owner gets, then the method. Uses property vocabulary precisely (scope of work, punch list, make-ready, turnover, planned vs. reactive maintenance, condition walkthrough, completion report). Commits to process, never to outcomes, numbers or response times. Names the actual document (scope, change record, completion report) rather than repeating "in writing".
- **Palette:** oxblood `#6a1f2b` (primary), deep oxblood `#2a0d12` (call-to-action band), warm stone neutrals (`#f3efe8`, `#d8d0c4`), ivory ground `#faf7f2`, charcoal text `#221f1d` / footer `#1f1c1a`. All text pairs meet WCAG AA (body text 15.3:1, secondary 8.4:1, meta 5.5:1, oxblood on ivory 10.7:1).
- **Type:** a single family, Instrument Sans (400–700), for everything. No monospace and no serif.
- **Labelling system:** section labels are sentence-case semibold text led by a short oxblood rule; column and field heads are plain semibold (no capitals, no letterspacing); numbers sit in small hairline-boxed reference tags with tabular lining figures. The "documented" character of the brand comes from the document and report components (completion-report sheet, at-a-glance panels, comparison tables), not from a typewriter face.
- **Visual language:** a modular grid with hairline rules, ledgers, matrices and document-style panels; moderate radius (2–6px); one consistent cool-neutral photographic direction (residential exteriors, small multifamily, common areas, ready-to-let interiors, maintenance in progress) with a light desaturation applied site-wide.
- **Logo:** square oxblood "K" monogram plus the full name set in Instrument Sans (`favicon.svg` is the monogram).

## Page map

```
/                                   Home
/services/                          Services overview (service sheets + arrangement matrix)
/services/planned-maintenance.html
/services/repairs.html
/services/renovation-refurbishment.html
/services/turnovers-make-ready.html
/services/pre-sale-pre-let.html
/services/exterior-building-upkeep.html
/who-we-work-with/                  Who we work with (overview + service/owner matrix)
/who-we-work-with/homeowners.html
/who-we-work-with/landlords.html
/who-we-work-with/property-managers.html
/who-we-work-with/commercial-premises.html
/how-we-work.html                   Process, arrangements, communication, documents, site standards
/about.html
/contact.html                       "Discuss your property" enquiry form
/privacy.html                       Privacy notice
/404.html
```

Files: `css/styles.css` (design tokens + components), `js/main.js` (mega menus, mobile drawer, tabs, scroll reveal, form), `favicon.svg`, `robots.txt`.

## Contact paths and service area

- **Primary path:** "Discuss your property" — the enquiry form on `contact.html`. It is the only button in the header, and it leads the button pairs in the home hero, the service and audience page headers, the mobile drawer and the CTA band.
- **Secondary path:** "Request a condition walkthrough" (`contact.html?next=walkthrough`, which preselects that option in the form) and email, `info@khanpropertyservices.com` (`mailto:` links). Both sit in the utility bar, the mobile drawer and the footer; the CTA band repeats the email under its two buttons.
- **No phone listed; add one later.** The company has no phone line yet, so the site shows no number anywhere. When there is one, add it to: the header (`.header-actions`, before the "Discuss your property" button — the old phone styles were removed from `css/styles.css`), the mobile drawer (`.drawer__contact`), the CTA band (`.cta__direct`), the footer (`.footer-contact`), the contact page header (`.contact-direct`) and its three form status panels, the privacy notice's "Questions" section, and the JSON-LD on `index.html` (`"telephone"`). The icon sprite on each page has no phone glyph, so add a `<symbol>` for it too. If the team also wants to call enquirers back, restore an optional phone field in the form (`contact.html`, plus its rule, `collect()` and `mailtoHref()` in `js/main.js`) and list it under "What we collect" in `privacy.html`.
- **Service area: Virginia and Florida** (states only — no cities, no coverage claims). It appears in the utility bar, the home hero eyebrow, the footer's bottom line, the contact page header and meta description, About ("We are"), the How we work at-a-glance panel and the JSON-LD `areaServed` on `index.html`. Change all of them together if the area changes.

## Preview locally

Serve the folder with any static server and open it in a browser — for example:

```
npx serve .            # or
python -m http.server 8000
```

Use a server rather than opening files directly: directory links such as `services/` resolve to `index.html` only when served.

## Interactive components

- **Mega menus** (Services, Who we work with): disclosure buttons with `aria-expanded`; open on click, or on hover with a mouse; Escape closes and returns focus. Without JavaScript they open on hover/focus.
- **Mobile drawer:** dialog with focus containment, Escape to close, accordion groups. Without JavaScript a "Menu" link jumps to the footer navigation.
- **Lifecycle diagram and audience switcher:** accessible tabs (arrow keys, Home/End). Without JavaScript every stage and audience panel is shown in sequence.
- **Scroll reveal:** content is only hidden once `main.js` is running, and never when the visitor prefers reduced motion.

## Enquiry form — configuring delivery

The form in `contact.html` works in two modes, chosen by its `action` attribute:

1. **Mail fallback (current setting):** `action="mailto:info@khanpropertyservices.com"`. With JavaScript, the site validates the form, then opens the visitor's email app with a formatted message (subject and body pre-filled) and tells them to press send — it never claims the message was received. Without JavaScript the browser's native mailto form submission is used.
2. **Form endpoint (recommended for launch):** replace the `action` with a form service URL, e.g. Formspree:

   ```html
   <form class="form form-card" action="https://formspree.io/f/your-id" method="post" ...>
   ```

   Any `action` starting with `http(s)://` is submitted with `fetch` as `FormData` (header `Accept: application/json`). A 2xx response shows the "Thank you — your enquiry has been sent" state; any error shows a retry message and keeps the visitor's details in the form. The hidden `_gotcha` field is a honeypot (Formspree recognizes it by name).

Also update `data-mailto` on the same `<form>` if the email address changes.

## Pre-launch checklist

Placeholders and items that must be replaced or confirmed before going live:

- [x] **Domain** — `khanpropertyservices.com` (GoDaddy), served by GitHub Pages via the `CNAME` file. Canonical URLs, `og:url`, `sitemap.xml` and the `robots.txt` sitemap line are in place.
- [ ] **Email inbox** — the site shows `info@khanpropertyservices.com`. Mail to it is not delivered until Google Workspace (or another provider) is set up for the domain and its MX records are added in GoDaddy.
- [ ] **Form delivery** — until a form endpoint is connected (see above), the contact form opens the visitor's email app addressed to `info@`. Connect an endpoint once the inbox works and send a test enquiry end to end.
- [ ] **404 page paths** — `404.html` uses root-relative paths (`/css/styles.css`); this works because the site is served from the domain root. Update them if the site ever moves under a sub-path.
- [ ] **Photography** — every photograph is representative stock imagery from Unsplash (hotlinked). Replace with the company's own photographs of its properties and work as soon as possible, keeping the same crops and the cool, bright, architectural direction. Do not caption stock images as specific jobs. The sample "completion report" on the home page is labelled as a sample format and should stay that way, or be replaced with a real (anonymized, client-approved) report.
- [ ] **Business details** — the service area (Virginia and Florida) is shown; no street address, opening hours, license numbers, insurance details or social media accounts are shown, because none were confirmed. Add them only once verified. If the business is licensed or insured for particular trades in Virginia or Florida, state that factually (with license numbers where required) — do not imply it otherwise.
- [ ] **Testimonials, reviews, client logos, project counts** — none are included. Add only genuine, attributable material with the client's permission.
- [ ] **Scope boundaries** — the copy states that gas, electrical panel/wiring, refrigerant HVAC, structural engineering, roofing replacement and hazardous-material work are outside the company's scope. Confirm this matches the business before launch.
- [ ] **Privacy notice** — a plain-language notice is included (`privacy.html`). Have it checked against the jurisdictions the business operates in, and add the legal entity name and contact once known.
- [ ] **Open Graph images** — currently Unsplash URLs (1200×630 crops). Replace with a branded image or the company's own photography when available.
- [ ] **Fonts** — Instrument Sans, loaded from Google Fonts. Self-host if a stricter privacy posture is wanted.

## Editing notes

- Design tokens (color, type scale, spacing, radius, motion) are CSS custom properties at the top of `css/styles.css`.
- Header, footer and the call-to-action band are repeated on every page; when changing navigation, contact details or the CTA, update all HTML files (search and replace works well).
- Icons are an inline SVG sprite (Lucide-style, 1.75 stroke) at the top of each page's `<body>`.
