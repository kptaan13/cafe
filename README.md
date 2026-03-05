# Virtual Café — Mixed Reality MVP

A **mixed reality** prototype: a simple 3D café scene with a **cutout** where your **real** food and drinks appear (live camera). No VR headset needed — use your **iPhone** (or any phone) in the browser.

## What you get

- **Relatable “sitting at a table” view**: By default the app loads a **café or restaurant** 360° environment (e.g. Poly Haven’s Comfy Café / Bush Restaurant), so it feels like you’re sitting with a table in front of you.
- **Table with cutout**: A virtual table has a **cutout** where the **live camera** is shown—place your real food and drinks there so they appear on “your” table.
- **Phone-first**: Works in **Safari on iPhone** (and other modern mobile browsers) over **HTTPS**.

## Push to GitHub

From the project folder in a terminal:

```bash
git init
git add .
git commit -m "Initial commit: Virtual Café mixed reality MVP"
```

Then create a new repository on [github.com](https://github.com/new) (do **not** add a README or .gitignore there). Copy its URL (e.g. `https://github.com/yourusername/virtual-cafe.git`) and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name. If GitHub asks you to sign in, use a personal access token instead of your password.

---

## Quick start (localhost)

From the project folder run:

```bash
npx serve .
```

Then open **http://localhost:3000** in your browser. The camera usually works on **localhost** (same computer).

## Share with network (e.g. Cursor “Connect to network”)

If you run the app and use **“Share” / “Connect to network”** (or port forwarding), you get a LAN URL like `http://192.168.x.x:3000`.

- **On your PC (same machine):** Use **http://localhost:3000** — camera works.
- **On your iPhone (same Wi‑Fi):** Open the **LAN URL** (e.g. `http://192.168.1.5:3000`). The page and 3D scene will load, but **the camera will usually be blocked** because that URL is plain HTTP, not HTTPS. Browsers only allow camera on secure contexts (HTTPS or `localhost`).

So: **localhost = yes for camera**. **LAN URL on your phone = page works, camera typically no** unless you use an HTTPS tunnel (see below).

## Deploy (HTTPS for camera on iPhone)

Deploy the project to get an **https://** URL so the camera works on your phone. Pick one:

### Option 1 — Vercel (no account needed from CLI)

1. Install Vercel CLI once: `npm i -g vercel`
2. In the project folder run: `vercel`
3. Log in or sign up when asked, accept defaults (link to current folder, no build command).
4. You get a URL like `https://virtual-cafe-xxx.vercel.app` — open it on your iPhone.

To deploy again: run `vercel` in the same folder.

### Option 2 — Netlify

1. Sign up at [netlify.com](https://netlify.com).
2. Drag and drop the **virtual cafe** folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect a Git repo that contains this project.
3. Netlify gives you an **https://** URL. Open it on your iPhone.

### Option 3 — GitHub Pages

1. Create a new repo on GitHub, push this project (only `index.html`, `app.js`, `README.md`).
2. In the repo: **Settings → Pages → Source**: choose “Deploy from a branch”.
3. Branch: `main`, folder: **/ (root)**. Save.
4. After a minute, the site is at `https://<username>.github.io/<repo-name>/`. Open that on your iPhone.

---

After deploying, open the **https://** URL on your iPhone, tap **“Tap to enable camera”**, choose **Allow**, and point the cutout at your table.

## Run without a server

Opening `index.html` directly (e.g. double‑click) loads the 3D scene, but the camera will not work (no origin, no HTTPS). The cutout area will appear dark.

## Optional: realistic look

- **Online environments:** If you don’t add your own panorama, the app loads **real 360° environments from the web** (e.g. Venice sunset, beach sunrise, bridge). No setup—just run the app.
- **Your own 360° image:** Put an equirectangular image (e.g. from Insta 360) in `assets/` as `panorama.jpg` or `360.jpg` to use it as the full environment (see [ASSETS.md](ASSETS.md)).
- **Beach textures:** Add sand, water, rock, etc. to `assets/` for a more realistic built‑in beach (see [ASSETS.md](ASSETS.md)).

## Project structure

- `index.html` — Page, camera, canvas, meta tags for mobile.
- `app.js` — Three.js beach scene, device orientation, camera-as-table, texture loading.
- `assets/` — Optional: put texture images here (see ASSETS.md).
- `ASSETS.md` — Guide to free textures and required filenames.
- `README.md` — This file.

## Tech

- **Three.js** (module, CDN) for the 3D scene.
- **getUserMedia** for the camera; video is shown in the cutout region.
- **Scissor** rendering so the 3D scene is drawn only outside the cutout; the rest of the screen is the live camera.

## Next steps (beyond MVP)

- Try **WebXR** in a browser that supports it (e.g. WebXR Viewer on iOS) for a more immersive view.
- Build a **native iOS** version with **ARKit** for better passthrough and depth.
- Add **VR headset** support (e.g. Quest) when you have hardware.
