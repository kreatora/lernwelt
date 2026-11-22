# Vanessas Hörecke

A simple German page with one MP3 download and its printable QR code. No activities, sign-in, or tracking.

## Add the recording

Edit `dist/config.js` and set `audio.url` to the public MP3 URL. The download button and the real QR code appear automatically. Until then, the page clearly shows that the recording is coming soon.

```js
window.LEARNING_CONFIG = {
  audio: {
    url: "https://your-public-host.example/vanessa.mp3",
    title: "Ein Gruß von Vanessa",
    filename: "vanessas-lernwelt.mp3"
  }
};
```

For a file hosted with the page, place it in `dist/audio/` and use `audio/vanessa.mp3` as the URL. Publish the updated site after changing files. The QR code encodes the absolute MP3 URL, not the page address. The MP3 must be accessible to your intended audience. For a forced download after scanning, configure the MP3 host to send `Content-Disposition: attachment; filename="vanessas-lernwelt.mp3"`; otherwise some phones open an audio player with a save/share option. The page's download button downloads same-origin MP3s directly and attempts a file download for external MP3s.

The **QR-Code speichern** button saves a scalable SVG for printing on a worksheet. No audio is uploaded or sent to a third-party QR service.

## Local preview

Run `python -m http.server 5173 --directory dist` in this directory and open http://localhost:5173.

The QR library is vendored from qrcode-generator 1.4.4 (MIT); its license is in `dist/vendor/LICENSE`.
