(() => {
  "use strict";
  const audio = window.LEARNING_CONFIG?.audio;
  if (!audio?.url) return;
  const status = document.getElementById("status");
  let url;
  try {
    url = new URL(audio.url, document.baseURI);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid MP3 URL");
  } catch {
    status.textContent = "Der Link zur Aufnahme ist noch nicht bereit.";
    return;
  }
  document.getElementById("recording-title").textContent = audio.title || "Ein Gruß von Vanessa";
  const download = document.getElementById("download");
  const filename = (audio.filename || "vanessas-lernwelt.mp3").replace(/[^a-zA-Z0-9._-]/g, "-");
  download.href = url.href;
  download.download = filename;
  download.removeAttribute("aria-disabled");
  status.textContent = "Kostenlos · Keine Anmeldung";
  download.addEventListener("click", async (event) => {
    // Same-origin files support native downloads. For remote files, try a Blob
    // download and keep a normal link as fallback when the host blocks CORS.
    if (url.origin === location.origin) return;
    event.preventDefault();
    if (download.dataset.busy) return;
    download.dataset.busy = "true";
    status.textContent = "Die Aufnahme wird geladen …";
    try {
      const response = await fetch(url.href, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error("Download unavailable");
      const blob = await response.blob();
      if (blob.type.includes("text/html")) throw new Error("Not an audio file");
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      status.textContent = "Dein Download wurde gestartet.";
    } catch {
      status.textContent = "Die Aufnahme wird direkt geöffnet. Dort kannst du sie speichern.";
      location.assign(url.href);
    } finally {
      delete download.dataset.busy;
    }
  });
  try {
    const qr = qrcode(0, "M");
    qr.addData(url.href);
    qr.make();
    const frame = document.getElementById("qr-frame");
    frame.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 20, scalable: true });
    frame.classList.add("ready");
    frame.firstElementChild.setAttribute("role", "img");
    frame.firstElementChild.setAttribute("aria-label", "QR-Code zur MP3-Aufnahme");
    document.getElementById("qr-instruction").textContent = "Scanne den Code mit deiner Handykamera.";
    const save = document.getElementById("save-qr");
    save.hidden = false;
    save.addEventListener("click", () => {
      const svg = frame.firstElementChild.cloneNode(true);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", "1000");
      svg.setAttribute("height", "1000");
      const objectUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "vanessa-mp3-qr.svg";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    });
  } catch {
    document.getElementById("qr-instruction").textContent = "Nutze den Download-Button, um die Aufnahme zu speichern.";
    status.textContent = "Der QR-Code konnte nicht erstellt werden.";
  }
})();
