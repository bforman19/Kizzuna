# Image Placement Guide — Disconnected Website

Drop your photos into this `images/` folder, then swap the
placeholder divs in each HTML file for real `<img>` tags.

---

## Recommended Image List

### Global (used on multiple pages)
| Filename              | Description                                                        | Used On               |
|-----------------------|--------------------------------------------------------------------|-----------------------|
| `hero-home.jpg`       | Full-screen cinematic still. Dark, atmospheric, warm amber tones. Person looking away or phone on table. | index.html hero       |
| `hero-film.jpg`       | Person at a window, phone face-down. Melancholy + beautiful.       | film.html hero        |
| `hero-speaking.jpg`   | Speaker on stage, warm stage lighting, engaged college audience.   | speaking.html hero    |
| `cta-bg.jpg`          | Hopeful wide shot — sunrise, campus, open field. Warm + expansive. | index.html final CTA  |

### Film Page
| Filename              | Description                                                        |
|-----------------------|--------------------------------------------------------------------|
| `film-split.jpg`      | Person outdoors without phone. Warm, slightly overexposed. 16:9.  |
| `film-wide.jpg`       | Establishing wide shot, 21:9 crop, cinematic warm color grade.    |
| `still-01.jpg`        | Portrait still — person looking off-screen, warm side light.      |
| `still-02.jpg`        | Central, emotionally resonant moment — quiet, real.               |
| `still-03.jpg`        | Group or landscape still — togetherness or open space.            |

### Speaking Page
| Filename              | Description                                                        |
|-----------------------|--------------------------------------------------------------------|
| `event-audience.jpg`  | Candid audience moment — students engaged, warm glow.             |
| `event-postshow.jpg`  | Post-event scene — students in organic conversation, foyer light. |

### About Page
| Filename              | Description                                                        |
|-----------------------|--------------------------------------------------------------------|
| `team-group.jpg`      | Candid team photo, natural light. Relaxed, real — not corporate.  |
| `team-01.jpg`         | Portrait — Team Member 1. Warm cinematic light. 3:4 ratio.        |
| `team-02.jpg`         | Portrait — Team Member 2. Same lighting style for consistency.    |
| `team-03.jpg`         | Portrait — Team Member 3. Match the others.                       |

---

## How to Swap a Placeholder

Find a block like this in any HTML file:

```html
<div class="img-frame__placeholder" style="height:100%;">
  <!-- [IMAGE] Description of the photo -->
  Film Still — Place Image Here
</div>
```

Replace it with:

```html
<img src="images/your-photo.jpg" alt="Description of photo" />
```

Keep the parent `.img-frame` div. The CSS handles `object-fit: cover`
and the hover zoom effect automatically.

---

## Image Size Recommendations

| Use Case        | Recommended Resolution | Notes                           |
|-----------------|------------------------|---------------------------------|
| Full-screen hero | 2560 × 1440 px        | Export at 85% JPG quality       |
| 16:9 film still | 1920 × 1080 px         | Export at 85% JPG quality       |
| 21:9 wide shot  | 2560 × 1100 px         | Export at 85% JPG quality       |
| Portrait (3:4)  | 900 × 1200 px          | Export at 85% JPG quality       |
| Team portraits  | 800 × 1067 px          | Consistent framing helps a lot  |

---

## Parallax Images

Hero backgrounds use a `data-parallax="0.2"` attribute.
The JavaScript handles this automatically — just make sure the
image is inside the `.hero__bg` div.

---

## Color Grade Note

For visual consistency, aim for warm tones:
- Golden hour / warm afternoon light
- Slightly desaturated greens
- Rich skin tones
- Avoid harsh blue-tinted footage or flash photography

The CSS applies an overlay that darkens and warms images slightly,
so even neutral shots will look cohesive on the site.
