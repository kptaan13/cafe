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
