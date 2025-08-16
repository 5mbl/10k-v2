"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props:
 * - isOpen, onClose, pdfUrl, initialPage, pagesHint, title
 * - highlights: [{ page: number, text: string }]
 */
export default function PdfModal({
  isOpen,
  onClose,
  pdfUrl,
  initialPage = 1,
  pagesHint = [],
  title = "Source PDF",
  highlights = [],
}) {
  const canvasRef = useRef(null);   // base PDF canvas
  const overlayRef = useRef(null);  // overlay for highlights
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const scale = 1.5; // tweak as you like

  // Lazy-load our pdf.js init (which also wires the worker)
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@/lib/pdfjs")
      .then(({ pdfjsLib }) => setPdfjsLib(pdfjsLib))
      .catch(console.error);
  }, []);

  // Only the highlights for the current page
  const pageHighlights = useMemo(
    () => {
      const filtered = (highlights || []).filter(h => h && Number(h.page) === Number(pageNum) && h.text);
      console.log("[HL] Page highlights for page", pageNum, ":", filtered.length, "items", filtered);
      return filtered;
    },
    [highlights, pageNum]
  );

  // Load document when opened or url changes
  useEffect(() => {
    if (!isOpen || !pdfjsLib || !pdfUrl) return;
    let cancelled = false;
    setLoading(true);

    const task = pdfjsLib.getDocument(pdfUrl);
    task.promise
      .then((doc) => {
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(p => (p && p <= doc.numPages ? p : 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      cancelled = true;
      try { task?.destroy?.(); } catch {}
    };
  }, [isOpen, pdfUrl, pdfjsLib]);

  // Render page and draw highlights
  useEffect(() => {
    if (!isOpen || !pdfDoc || !canvasRef.current || !pdfjsLib) return;

    (async () => {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Device pixel ratio for crisp rendering
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      // Size base canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw at DPR

      // Render page
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Size overlay canvas identically
      const overlay = overlayRef.current;
      if (overlay) {
        const octx = overlay.getContext("2d");
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
        overlay.width = Math.floor(viewport.width * dpr);
        overlay.height = Math.floor(viewport.height * dpr);
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        octx.clearRect(0, 0, overlay.width, overlay.height);

        // Always try to draw highlights, even if empty (for debugging)
        console.log("[HL] Attempting to draw highlights for page", pageNum, "count:", pageHighlights.length);
        
        if (pageHighlights.length) {
          console.log("[HL] page", pageNum, "count", pageHighlights.length, pageHighlights);
          try {
            const textContent = await page.getTextContent();
            console.log("[HL] text items", textContent.items.length);
            
            // Debug: Log some text content for troubleshooting
            if (textContent.items.length > 0) {
              console.log("[HL] Sample text items:", textContent.items.slice(0, 5).map(item => ({
                str: item.str,
                transform: item.transform,
                width: item.width
              })));
            }
            
            drawHighlights({
              pdfjsLib,
              textContent,
              viewport,
              octx,
              requested: pageHighlights,
            });
          } catch (e) {
            console.warn("Highlighting failed:", e);
          }
        } else {
          console.log("[HL] No highlights for page", pageNum);
        }
      }
    })();
  }, [isOpen, pdfDoc, pageNum, pageHighlights, pdfjsLib]);

  const goPrev = () => setPageNum(p => Math.max(1, p - 1));
  const goNext = () => setPageNum(p => Math.min(numPages, p + 1));
  const jumpTo = (p) => setPageNum(Math.min(Math.max(1, Number(p) || 1), numPages || 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-xl overflow-hidden flex flex-col border-4 border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{title}</span>
            <span className="text-gray-500 text-sm">
              ({pageNum}/{numPages || "…"})
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {pagesHint.length > 0 && (
          <div className="px-6 py-3 border-b bg-gray-50 flex flex-wrap gap-2">
            {pagesHint.map((p) => (
              <button
                key={p}
                onClick={() => jumpTo(p)}
                className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                  pageNum === p ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-200 border-gray-300"
                }`}
              >
                p. {p}
              </button>
            ))}
          </div>
        )}

        {/* canvas stack */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="flex items-center justify-center min-h-full">
            {loading ? (
              <div className="text-lg text-gray-600 p-6">Loading PDF…</div>
            ) : (
              <div className="relative bg-white rounded-lg shadow-lg m-6">
                {/* Base canvas */}
                <canvas ref={canvasRef} className="block rounded-lg" />
                {/* Overlay canvas */}
                <canvas
                  ref={overlayRef}
                  key={`overlay-${pageNum}-${pageHighlights.length}-${JSON.stringify(pageHighlights)}`}
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pageNum <= 1}
            >
              <ChevronLeft className="w-5 h-5 inline mr-1" />
              Prev
            </button>
            <button
              onClick={goNext}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pageNum >= numPages}
            >
              Next
              <ChevronRight className="w-5 h-5 inline ml-1" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Go to page</label>
            <input
              type="number"
              min={1}
              max={numPages || 999}
              value={pageNum}
              onChange={(e) => jumpTo(e.target.value)}
              className="w-24 border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Highlight engine -------------------- */

// normalize to improve match robustness - less aggressive
function norm(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, " ") // replace punctuation with spaces
    .trim()
    .toLowerCase();
}

// More robust text normalization that preserves more structure
function normPreserve(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Special normalization for bullet points and lists
function normBullets(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/[•·▪▫◦‣⁃]/g, " ") // replace various bullet characters
    .replace(/[^\w\s]/g, " ") // replace other punctuation with spaces
    .trim()
    .toLowerCase();
}

// Special normalization for text with semicolons and colons
function normSemicolons(s) {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/[;:]/g, " ") // replace semicolons and colons with spaces
    .replace(/[^\w\s]/g, " ") // replace other punctuation with spaces
    .trim()
    .toLowerCase();
}

// Build candidate needles with more variations
function candidateNeedles(raw) {
  const n = norm(raw);
  const nPreserve = normPreserve(raw);
  const nBullets = normBullets(raw);
  const nSemicolons = normSemicolons(raw);
  const out = [];
  
  if (n) out.push(n);
  if (nPreserve) out.push(nPreserve);
  if (nBullets) out.push(nBullets);
  if (nSemicolons) out.push(nSemicolons);
  
  // Add truncated versions for long text
  if (n.length > 300) out.push(n.slice(0, 300));
  if (n.length > 200) out.push(n.slice(0, 200));
  if (n.length > 150) out.push(n.slice(0, 150));
  if (n.length > 100) out.push(n.slice(0, 100));
  
  // Add versions without common words for better matching
  const withoutCommon = n.replace(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g, "").trim();
  if (withoutCommon.length > 20) out.push(withoutCommon);
  
  // Add versions that handle semicolons and other separators
  const semicolonSplit = raw.split(/[;:]/).map(part => norm(part.trim())).filter(part => part.length > 10);
  out.push(...semicolonSplit);
  
  return Array.from(new Set(out));
}

// Extract distinct words from text for fallback matching - more comprehensive
function wordsFrom(raw, minLen = 3, maxWords = 20) {
  const w = norm(raw).split(" ").filter((x) => x.length >= minLen);
  // unique, keep order
  const seen = new Set();
  const uniq = [];
  for (const x of w) {
    if (!seen.has(x)) { seen.add(x); uniq.push(x); }
    if (uniq.length >= maxWords) break;
  }
  return uniq;
}

// Fuzzy matching for text that's similar but not exact
function fuzzyMatch(text1, text2, threshold = 0.8) {
  const norm1 = norm(text1);
  const norm2 = norm(text2);
  
  if (norm1 === norm2) return true;
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // Simple similarity check - count common words
  const words1 = new Set(norm1.split(" ").filter(w => w.length > 2));
  const words2 = new Set(norm2.split(" ").filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size >= threshold;
}

function drawHighlights({ pdfjsLib, textContent, viewport, octx, requested }) {
  const items = textContent.items || [];
  
  // Create multiple text representations for better matching
  const itemNorm = items.map((it) => norm(it.str || ""));
  const itemNormPreserve = items.map((it) => normPreserve(it.str || ""));
  const itemNormBullets = items.map((it) => normBullets(it.str || ""));
  const itemNormSemicolons = items.map((it) => normSemicolons(it.str || ""));
  const full = itemNorm.join("");
  const fullPreserve = itemNormPreserve.join("");
  const fullBullets = itemNormBullets.join("");
  const fullSemicolons = itemNormSemicolons.join("");

  // precompute cumulative char offsets for all representations
  const lens = itemNorm.map((s) => s.length);
  const lensPreserve = itemNormPreserve.map((s) => s.length);
  const lensBullets = itemNormBullets.map((s) => s.length);
  const lensSemicolons = itemNormSemicolons.map((s) => s.length);
  const cum = [];
  const cumPreserve = [];
  const cumBullets = [];
  const cumSemicolons = [];
  for (let i = 0, acc = 0; i < lens.length; i++) { cum.push(acc); acc += lens[i]; }
  for (let i = 0, acc = 0; i < lensPreserve.length; i++) { cumPreserve.push(acc); acc += lensPreserve[i]; }
  for (let i = 0, acc = 0; i < lensBullets.length; i++) { cumBullets.push(acc); acc += lensBullets[i]; }
  for (let i = 0, acc = 0; i < lensSemicolons.length; i++) { cumSemicolons.push(acc); acc += lensSemicolons[i]; }

  const matches = [];
  const matchedItems = new Set(); // Track which items we've already matched

  // 1) Try long string matches with multiple strategies
  for (const h of requested) {
    const candidates = candidateNeedles(h.text);
    let hit = false;
    
    // Try matching against both normalized versions
    for (const needle of candidates) {
      // Try against normalized text
      let idx = full.indexOf(needle);
      if (idx !== -1) {
        matches.push({ type: "block", start: idx, end: idx + needle.length, source: "norm" });
        hit = true;
        break;
      }
      
      // Try against preserved text
      idx = fullPreserve.indexOf(needle);
      if (idx !== -1) {
        matches.push({ type: "block", start: idx, end: idx + needle.length, source: "preserve" });
        hit = true;
        break;
      }
      
      // Try against bullet-normalized text
      idx = fullBullets.indexOf(needle);
      if (idx !== -1) {
        matches.push({ type: "block", start: idx, end: idx + needle.length, source: "bullets" });
        hit = true;
        break;
      }

      // Try against semicolon-normalized text
      idx = fullSemicolons.indexOf(needle);
      if (idx !== -1) {
        matches.push({ type: "block", start: idx, end: idx + needle.length, source: "semicolons" });
        hit = true;
        break;
      }
    }
    
    // 2) If not found, fall back to per-word item hits with better matching
    if (!hit) {
      const words = wordsFrom(h.text, 3, 15); // More words, shorter minimum length
      
      for (const w of words) {
        for (let i = 0; i < itemNorm.length; i++) {
          // Check all normalized versions
          if (itemNorm[i].includes(w) || itemNormPreserve[i].includes(w) || itemNormBullets[i].includes(w) || itemNormSemicolons[i].includes(w)) {
            if (!matchedItems.has(i)) {
              matches.push({ type: "item", i });
              matchedItems.add(i);
            }
          }
        }
      }
      
      // If still no matches, try partial word matching
      if (words.length === 0) {
        const partialWords = norm(h.text).split(" ").filter(x => x.length >= 2);
        for (const w of partialWords) {
          for (let i = 0; i < itemNorm.length; i++) {
            if (itemNorm[i].includes(w) || itemNormPreserve[i].includes(w) || itemNormBullets[i].includes(w) || itemNormSemicolons[i].includes(w)) {
              if (!matchedItems.has(i)) {
                matches.push({ type: "item", i });
                matchedItems.add(i);
              }
            }
          }
        }
      }
      
      // 3) If still no matches, try fuzzy matching
      if (!hit && matches.filter(m => m.type === "item").length === 0) {
        for (let i = 0; i < items.length; i++) {
          const itemText = items[i].str || "";
          if (fuzzyMatch(h.text, itemText, 0.6)) { // Lower threshold for fuzzy matching
            if (!matchedItems.has(i)) {
              matches.push({ type: "item", i });
              matchedItems.add(i);
            }
          }
        }
      }
    }
  }

  console.log("[HL] matches", matches.length, matches.slice(0, 10));

  // Debug: Log what we're trying to match
  console.log("[HL] Requested highlights:", requested.map(h => ({
    text: h.text,
    textLength: h.text.length,
    normalized: norm(h.text),
    words: wordsFrom(h.text, 3, 15)
  })));

  // Debug: Log some of the PDF text content
  console.log("[HL] PDF text sample:", itemNorm.slice(0, 10));
  console.log("[HL] PDF text preserved sample:", itemNormPreserve.slice(0, 10));
  console.log("[HL] PDF text bullets sample:", itemNormBullets.slice(0, 10));
  console.log("[HL] PDF text semicolons sample:", itemNormSemicolons.slice(0, 10));

  // draw
  octx.save();
  octx.globalAlpha = 0.35;
  octx.fillStyle = "#FFE066";
  octx.lineWidth = 2;
  octx.strokeStyle = "#C9A227";

  // helpers
  const toRect = (it) => {
    const tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
    const x = tx[4];
    const yTop = tx[5];
    const h = Math.hypot(tx[2], tx[3]);
    const w = (it.width || 0) * viewport.scale;
    const y = yTop - h;
    return { x, y, w, h };
  };

  const drawRect = (r) => {
    if (!isFinite(r.x) || !isFinite(r.y) || !isFinite(r.w) || !isFinite(r.h)) return;
    octx.fillRect(r.x, r.y, r.w, r.h);
    octx.strokeRect(r.x, r.y, r.w, r.h);
  };

  // A) block matches -> union of item rects across covered range
  for (const m of matches.filter(m => m.type === "block")) {
    const [iStart, iEnd] = charRangeToItems(
      m.start, 
      m.end, 
      m.source === "preserve" ? cumPreserve : 
      m.source === "bullets" ? cumBullets : 
      m.source === "semicolons" ? cumSemicolons : cum, 
      m.source === "preserve" ? lensPreserve : 
      m.source === "bullets" ? lensBullets : 
      m.source === "semicolons" ? lensSemicolons : lens
    );
    let union = null;
    for (let i = iStart; i <= iEnd; i++) {
      const it = items[i];
      if (!it) continue;
      const r = toRect(it);
      if (!union) union = { ...r };
      else {
        const minX = Math.min(union.x, r.x);
        const minY = Math.min(union.y, r.y);
        const maxX = Math.max(union.x + union.w, r.x + r.w);
        const maxY = Math.max(union.y + union.h, r.y + r.h);
        union = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
    }
    if (union) drawRect(union);
  }

  // B) item matches -> draw each item's rect
  for (const m of matches.filter(m => m.type === "item")) {
    const it = items[m.i];
    if (it) drawRect(toRect(it));
  }

  octx.restore();
}

function charRangeToItems(start, end, cum, lens) {
  // Handle edge cases
  if (start >= end || cum.length === 0) return [0, 0];
  
  let iStart = 0;
  // Find the first item that contains or starts after our start position
  while (iStart < cum.length && cum[iStart] + lens[iStart] <= start) iStart++;
  
  let iEnd = iStart;
  // Find the last item that contains or ends before our end position
  while (iEnd < cum.length && cum[iEnd] < end) iEnd++;
  
  // Ensure we don't go out of bounds
  iStart = Math.max(0, Math.min(iStart, cum.length - 1));
  iEnd = Math.max(iStart, Math.min(iEnd, cum.length - 1));
  
  return [iStart, iEnd];
}

