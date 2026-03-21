# RT VIEWER

[![CI](https://github.com/choijinkyung/RT-VIEWER/actions/workflows/ci.yml/badge.svg)](https://github.com/choijinkyung/RT-VIEWER/actions/workflows/ci.yml)
[![Deploy](https://github.com/choijinkyung/RT-VIEWER/actions/workflows/deploy.yml/badge.svg)](https://github.com/choijinkyung/RT-VIEWER/actions/workflows/deploy.yml)


<img width="5120" height="2584" alt="image" src="https://github.com/user-attachments/assets/4537f2a3-4d1d-428d-a5fa-88e6119d0b97" />


RT Viewer is a React-based radiation therapy imaging workspace built on Cornerstone. It is designed to inspect CT images together with RT Structure and RT Dose overlays in a workflow that feels closer to a clinical viewer.

Live demo:
- https://choijinkyung.github.io/RT-VIEWER/

## Highlights

- CT, RT Structure, and RT Dose overlay support
- Image Layout and Series Layout modes
- Grid presets from `1x1` to `4x4`
- Per-viewport overlay redraw for responsive layouts
- Cornerstone interaction and annotation tools
- Bundled `TEST849` sample case for quick validation
- GitHub Actions based CI and GitHub Pages deployment

## Getting Started

### Requirements

- Node.js 18 or newer
- npm

### Install

```bash
git clone https://github.com/choijinkyung/RT-VIEWER.git
cd RT-VIEWER
npm install
```

### Run locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The sample manifest is prepared automatically before `start` and `build`.

## Main Workflow

1. Load the bundled sample with `Load TEST849 sample` or open your own patient folder.
2. Choose `Image Layout` or `Series Layout` from the left tool panel.
3. Pick a grid preset under the selected layout mode.
4. Enable RT Structure or RT Dose from the overlay controls.
5. Use the Cornerstone tools to inspect, measure, and annotate the images.

## Keyboard And Navigation

- `Esc`: clear the active Cornerstone tool
- `ArrowUp` / `PageUp`: move forward
- `ArrowDown` / `PageDown`: move backward
- Mouse wheel: move through the current page set based on the active layout

## Available Scripts

### `npm start`

Starts the development server.

### `npm test`

Runs the test suite through CRACO.

### `npm run build`

Builds the production bundle into `build/`.

### `npm run jsdoc`

Regenerates API documentation from JSDoc comments.

## GitHub Actions

This repository now uses GitHub Actions for validation and deployment.

### CI

Workflow:
- `.github/workflows/ci.yml`

Runs on:
- pull requests
- pushes to `main`

Checks:
- `npm ci`
- `CI=true npm test -- --watch=false`
- `npm run build`

### Deploy

Workflow:
- `.github/workflows/deploy.yml`

Runs on:
- pushes to `main`

Deployment target:
- GitHub Pages with the official Pages actions

Required repository setting:
1. Open `Settings > Pages`
2. Set `Source` to `GitHub Actions`

## Technical Notes

### Coordinate transformation

To convert Dose coordinates into CT pixel space, the viewer uses:

- Dose -> Patient matrix
- CT -> Patient matrix

That means Dose -> CT requires:

- Dose -> Patient
- Patient -> CT

The CT -> Patient matrix must therefore be inverted to obtain Patient -> CT.

### Dose values

Dose values come from:

- RT Dose Pixel Data `(7fe0,0010)`
- Dose Grid Scaling `(3004,000e)`

Formula:

```text
Dose Value = Pixel Data * Dose Grid Scaling
```

### References

- Cornerstone: https://github.com/cornerstonejs
- Cornerstone examples: https://cornerstonejs.org/
- dicomParser example reference: https://rawgit.com/cornerstonejs/dicomParser/master/examples/index.html

## API Documentation

JSDoc output is generated from:

```bash
npm run jsdoc
```

Open the generated docs from:

```text
./API_document/index.html
```

## Contribution

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for contribution guidelines and pull request etiquette.

## Author

- Name: [Jinkyung Choi](https://github.com/choijinkyung)
- E-mail: jinkyung.dev@gmail.com
- GitHub: https://github.com/choijinkyung

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
