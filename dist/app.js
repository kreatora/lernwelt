(() => {
  "use strict";
  const recordings = window.LEARNING_CONFIG?.recordings ?? [];

  for (const recording of recordings) {
    const card = document.querySelector(`[data-recording="${recording.id}"]`);
    if (!card) continue;

    const status = card.querySelector("[data-status]");
    const instruction = card.querySelector("[data-instruction]");
    let url;
    try {
      url = new URL(recording.url, document.baseURI);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid audio URL");
    } catch {
      status.textContent = "Der Link zur Aufnahme ist noch nicht bereit.";
      return;
    }

    const title = recording.title || "Weihnachtsgruß";
    const filename = (recording.filename || `${recording.id}.m4a`).replace(/[^a-zA-Z0-9._-]/g, "-");
    const download = card.querySelector("[data-download]");
    const frame = card.querySelector("[data-qr]");
    const save = card.querySelector("[data-save]");
    if (!url.pathname.endsWith("/")) download.download = filename;

    // This catches missing local files so the page keeps its placeholder until
    // Vanessa has added both recordings. Remote hosts may not allow HEAD.
    if (url.origin === location.origin) {
      fetch(url.href, { method: "HEAD" }).then((response) => {
        if (response.ok) activateRecording();
        else status.textContent = "Die Aufnahme wird bald hinzugefügt.";
      }).catch(() => {
        status.textContent = "Die Aufnahme wird bald hinzugefügt.";
      });
    } else {
      activateRecording();
    }

    function activateRecording() {
      download.href = url.href;
      download.removeAttribute("aria-disabled");
      status.textContent = "Kostenlos · Keine Anmeldung";
      instruction.textContent = "Scanne den Code mit deiner Handykamera.";
      download.addEventListener("click", async (event) => {
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
        frame.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 20, scalable: true });
        frame.classList.add("ready");
        frame.firstElementChild.setAttribute("role", "img");
        frame.firstElementChild.setAttribute("aria-label", `QR-Code für ${title}`);
        save.hidden = false;
        save.addEventListener("click", () => {
          const svg = frame.firstElementChild.cloneNode(true);
          svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svg.setAttribute("width", "1000");
          svg.setAttribute("height", "1000");
          const objectUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
          const anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = `${recording.id}-qr.svg`;
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        });
      } catch {
        instruction.textContent = "Nutze den Download-Button, um den Gruß zu speichern.";
        status.textContent = "Der QR-Code konnte nicht erstellt werden.";
      }
    }
  }
})();
