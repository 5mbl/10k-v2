// lib/pdfjs.js
// IMPORTANT: only import this from "use client" components
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

// In browsers only
if (typeof window !== "undefined") {
  try {
    // Create a module worker and hand it to pdf.js
    const worker = new Worker("/pdf.worker.min.mjs", { type: "module" });
    pdfjsLib.GlobalWorkerOptions.workerPort = worker;
  } catch (e) {
    // Fallback: disable worker (runs parsing on main thread)
    console.warn("PDF.js worker setup failed, falling back to no worker:", e);
    pdfjsLib.GlobalWorkerOptions.workerPort = null;
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  }
}

export { pdfjsLib };
