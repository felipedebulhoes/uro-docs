// Open a self-contained HTML document in a new tab for printing / "Save as PDF".
//
// We intentionally avoid `document.write` on the popup: some deployment
// environments enforce a Trusted Types CSP, which throws
// "This document requires 'TrustedHTML' assignment." Loading the HTML via a
// Blob URL sidesteps that policy entirely and works offline (no libraries).
//
// The HTML should embed its own auto-print script (e.g. `window.onload =>
// window.print()`), so this helper only needs to navigate to the Blob URL.

export function openPrintableDocument(html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const w = window.open(url, "_blank");
  if (!w) {
    // Popup blocked: fall back to navigating via a temporary anchor, which is
    // generally allowed because it is a direct result of the user gesture.
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Revoke later so the new tab has time to load the document.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
