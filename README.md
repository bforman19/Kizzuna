# Disconnected — Website

Youth-led documentary film & college speaking initiative.
Warm autumn glow design system. Cinematic, minimalist, emotionally immersive.

---

## File Structure

```
disconnected/
├── index.html        Home page
├── film.html         The Film page
├── speaking.html     Speaking Events page
├── about.html        About Us page
├── book.html         Book Us page (includes inquiry form)
├── styles.css        All styles — warm autumn glow theme
├── script.js         Scroll animations, parallax, accordion, counter, etc.
└── images/
    ├── IMAGES-GUIDE.md   ← Read this to place photos
    └── (your photos go here)
```

---

## To Launch Locally

Just open `index.html` in a browser — no build step needed.
Everything is vanilla HTML/CSS/JS with Google Fonts loaded via CDN.

---

## To Add Your Photos

1. Read `images/IMAGES-GUIDE.md` for the full list of needed photos
2. Drop your files into the `images/` folder
3. In each HTML file, find the placeholder comments like:
   ```html
   <!-- [IMAGE] Description -->
   Film Still — Place Image Here
   ```
4. Replace the inner `<div class="img-frame__placeholder">` block with:
   ```html
   <img src="images/your-filename.jpg" alt="Description" />
   ```

---

## To Update Team Info (about.html)

Search for `[Name]` and `[Short personal bio]` placeholders in `about.html`
and replace with real team member names, roles, and bios.

Also update `[University Name]` and `[X campuses]` with your actual info.

---

## To Update Contact Info

1. Search all files for `hello@disconnectedfilm.com` and replace with your real email
2. Update social media links in each footer (`href="#"` placeholders)
3. Update the copyright year and entity name in footers if needed

---

## Key Design Tokens (styles.css)

| Token           | Value     | Used For                         |
|-----------------|-----------|----------------------------------|
| `--amber`       | `#FE938C` | Coral — primary accent, CTAs     |
| `--gold`        | `#E6B89C` | Peach — secondary accent         |
| `--terracotta`  | `#4281A4` | Steel blue — contrast accent     |
| `--rust`        | `#9CAFB7` | Muted blue — subtle accents      |
| `--bg-void`     | `#09080A` | Darkest background               |
| `--text-primary`| `#F5EDE8` | Main body text (warm off-white)  |

---

## Scroll Animations

Add `.reveal` to any element to have it fade up on scroll.
- `.reveal--left` / `.reveal--right` for directional reveals
- `.reveal--scale` for a subtle scale entrance
- Wrap a group in `.stagger` to auto-delay children

```html
<div class="stagger">
  <div class="reveal">Item 1 — fades at 0s delay</div>
  <div class="reveal">Item 2 — fades at 0.1s delay</div>
  <div class="reveal">Item 3 — fades at 0.2s delay</div>
</div>
```

---

## Counter Animation

Add `data-count` and optional `data-suffix` to any element:

```html
<span data-count="73" data-suffix="%">0%</span>
```

Numbers count up when they scroll into view.

---

## Deploying

This site is static — upload all files to any host:
- **Netlify**: drag the folder into netlify.com/drop
- **Vercel**: `vercel --prod` from this directory
- **GitHub Pages**: push to a repo and enable Pages in settings
- **Any web host**: upload via FTP/SFTP

No server, no database, no dependencies to install.
