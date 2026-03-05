<<<<<<< HEAD
# Optional Textures for a More Realistic Scene

The app works without any extra files. To make the scene more realistic, add images to the **`assets`** folder as below.

---

## 360° panorama (e.g. Insta 360)

You can use a **360° equirectangular image** (e.g. from Insta 360) as the **entire environment**. When the app finds it, you’ll be “inside” your photo: move your phone to look around the 360° scene, and the camera “table” still shows your real food and drinks in front of you.

**What to do**

1. Export your 360 photo from the Insta 360 app (or camera) as an **equirectangular** image (JPG or PNG). This is usually the default export.
2. Put it in the `assets/` folder with one of these names:
   - **`panorama.jpg`** or **`panorama.png`**
   - or **`360.jpg`** or **`360.png`**
3. Refresh the app. If the file is found, the built‑in beach is replaced by your 360° image.

No other files are required for this. The “table” with the live camera is still shown when you enable the camera.

---

## Online environments (no download) – “person sitting, cutout on table”

If you don’t add a panorama in `assets/`, the app loads a **relatable “sitting at a table” environment** from the internet. It tries, in order:

1. **Comfy Café** (Poly Haven) – indoor café, like sitting at a table  
2. **Bush Restaurant** (Poly Haven) – restaurant interior  
3. Then other 360° scenes (Venice sunset, beach, bridge, etc.) if the café/restaurant URLs don’t load (e.g. CORS).

So by default you get a **person-sitting view** with a **table in front** and a **cutout on that table** for your real food. No setup—just run the app. To use your own 360° image instead, add `panorama.jpg` or `360.jpg` to `assets/`; local files are tried first.

---

## Texture filenames (for the built‑in beach)

If you’re **not** using a 360 image, you can add these textures to improve the default beach:

| File        | Used for        | Suggestion |
|------------|------------------|------------|
| `sand.jpg` | Beach sand       | Light tan/beige, seamless |
| `water.jpg`| Ocean            | Blue, seamless |
| `shore.jpg`| Wet sand / foam  | Lighter than sand, seamless |
| `rock.jpg` | Rocks            | Gray/brown, any size |
| `bark.jpg` | Palm trunks      | Brown, vertical repeat |
| `leaves.jpg`| Palm leaves     | Green, seamless |
| `sky.jpg`  | Sky dome         | Light blue gradient or clouds (optional) |

Use **JPG** or **PNG**. The app will tile them where needed.

---

## Where to download (free, no sign-up)

### Poly Haven (CC0 – use anywhere)
- **Site:** [polyhaven.com/textures](https://polyhaven.com/textures)
- **Sand:** Search “sand” or “ground” → pick a light, seamless texture → download **1K** or **2K**, use the **diffuse/color** file and rename to `sand.jpg`.
- **Water:** Search “water” or “ocean” → download diffuse, rename to `water.jpg`.
- **Rock:** Search “rock” or “stone” → download diffuse, rename to `rock.jpg`.
- **Bark:** Search “bark” or “wood” → download diffuse, rename to `bark.jpg`.
- **Leaves:** Search “leaves” or “foliage” → download a green diffuse, rename to `leaves.jpg`.

### ambientCG (CC0)
- **Site:** [ambientcg.com](https://ambientcg.com/list)
- **Ground/Sand:** Category “Ground” → e.g. “Sand”, “Beach” → download **1K-JPG**, unzip and rename the color map to `sand.jpg`, `shore.jpg`, etc.
- **Rock:** “Rock” or “Stone” → 1K-JPG, rename to `rock.jpg`.
- **Wood/Bark:** “Wood” → 1K-JPG, rename to `bark.jpg`.

### Quick steps (Poly Haven example)

1. Create a folder: `assets` (next to `index.html`).
2. Go to [polyhaven.com/textures](https://polyhaven.com/textures).
3. Open a texture (e.g. “Sand 001” or “Ground Sand”).
4. Download **1K** or **2K**, **JPG** (diffuse/color).
5. Rename the file to match the table above (e.g. `sand.jpg`) and put it in `assets/`.
6. Repeat for `water.jpg`, `shore.jpg`, `rock.jpg`, `bark.jpg`, `leaves.jpg` (and optionally `sky.jpg`).
7. Refresh the app; the scene will use these textures automatically.

If a file is missing, that part of the scene keeps its default solid color. You can add textures one by one.
=======
# Optional Textures for a More Realistic Scene

The app works without any extra files. To make the beach look more realistic, add image textures to the **`assets`** folder using the filenames below. All of these can be downloaded for free.

## Required filenames (place in `assets/`)

| File        | Used for        | Suggestion |
|------------|------------------|------------|
| `sand.jpg` | Beach sand       | Light tan/beige, seamless |
| `water.jpg`| Ocean            | Blue, seamless |
| `shore.jpg`| Wet sand / foam  | Lighter than sand, seamless |
| `rock.jpg` | Rocks            | Gray/brown, any size |
| `bark.jpg` | Palm trunks      | Brown, vertical repeat |
| `leaves.jpg`| Palm leaves     | Green, seamless |
| `sky.jpg`  | Sky dome         | Light blue gradient or clouds (optional) |

Use **JPG** or **PNG**. The app will tile them where needed.

---

## Where to download (free, no sign-up)

### Poly Haven (CC0 – use anywhere)
- **Site:** [polyhaven.com/textures](https://polyhaven.com/textures)
- **Sand:** Search “sand” or “ground” → pick a light, seamless texture → download **1K** or **2K**, use the **diffuse/color** file and rename to `sand.jpg`.
- **Water:** Search “water” or “ocean” → download diffuse, rename to `water.jpg`.
- **Rock:** Search “rock” or “stone” → download diffuse, rename to `rock.jpg`.
- **Bark:** Search “bark” or “wood” → download diffuse, rename to `bark.jpg`.
- **Leaves:** Search “leaves” or “foliage” → download a green diffuse, rename to `leaves.jpg`.

### ambientCG (CC0)
- **Site:** [ambientcg.com](https://ambientcg.com/list)
- **Ground/Sand:** Category “Ground” → e.g. “Sand”, “Beach” → download **1K-JPG**, unzip and rename the color map to `sand.jpg`, `shore.jpg`, etc.
- **Rock:** “Rock” or “Stone” → 1K-JPG, rename to `rock.jpg`.
- **Wood/Bark:** “Wood” → 1K-JPG, rename to `bark.jpg`.

### Quick steps (Poly Haven example)

1. Create a folder: `assets` (next to `index.html`).
2. Go to [polyhaven.com/textures](https://polyhaven.com/textures).
3. Open a texture (e.g. “Sand 001” or “Ground Sand”).
4. Download **1K** or **2K**, **JPG** (diffuse/color).
5. Rename the file to match the table above (e.g. `sand.jpg`) and put it in `assets/`.
6. Repeat for `water.jpg`, `shore.jpg`, `rock.jpg`, `bark.jpg`, `leaves.jpg` (and optionally `sky.jpg`).
7. Refresh the app; the scene will use these textures automatically.

If a file is missing, that part of the scene keeps its default solid color. You can add textures one by one.
>>>>>>> 9f756cfdba20259a9e3cea4e3964bbde79beff3e
