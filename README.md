# Vanessas Hörecke

A simple German page with two individual audio downloads and printable QR codes.

Put the recordings in `dist/audio/` with these filenames:

- `nikolaus-felix.m4a`
- `nikolaus-d.m4a`

The page displays each download and its QR code when the matching audio file exists. The QR codes lead directly to their respective audio files. To publish an update, commit and push the changes; GitHub Pages uses `.github/workflows/pages.yml` to deploy the contents of `dist/`.

To preview locally, run `python -m http.server 8000 --directory dist` from this folder and visit http://localhost:8000.
