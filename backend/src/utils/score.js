// src/utils/score.js
/**
 * ShipSmart Shipping Score Algorithm
 *
 * Meesho calculates shipping charges using volumetric weight:
 *   Vol. Weight = (L × W × H) ÷ 5000
 *
 * A white-background, square 1080×1080 JPEG under 200 KB signals to Meesho's
 * system that the product is compact and standard — avoiding oversized
 * product surcharges. This function scores each variant 0–100.
 *
 * Score breakdown (total 100 pts):
 *   File size     35 pts   — smallest file = least chance of auto-resize
 *   Square format 20 pts   — 1:1 ratio signals compact packaging
 *   Dimensions    20 pts   — exactly 1080×1080 matches Meesho's recommended spec
 *   White BG      20 pts   — avoids "oversized" category detection
 *   Brightness     5 pts   — well-lit images reduce returns → lower shipping tier
 */
function calcShippingScore({ fileSizeKB, width, height, hasWhiteBg, isBright }) {
  let score = 0;

  // ── File size score (35 pts) ──────────────────────────────────────────────
  if (fileSizeKB < 80)       score += 35;
  else if (fileSizeKB < 150) score += 30;
  else if (fileSizeKB < 200) score += 26;
  else if (fileSizeKB < 350) score += 20;
  else if (fileSizeKB < 500) score += 14;
  else if (fileSizeKB < 800) score += 8;
  else                        score += 3;

  // ── Square format score (20 pts) ──────────────────────────────────────────
  const aspectRatio = width / height;
  if (aspectRatio >= 0.99 && aspectRatio <= 1.01) score += 20;
  else if (aspectRatio >= 0.95 && aspectRatio <= 1.05) score += 12;
  else if (aspectRatio >= 0.9  && aspectRatio <= 1.1)  score += 6;

  // ── Dimensions score (20 pts) ─────────────────────────────────────────────
  if (width === 1080 && height === 1080)          score += 20;
  else if (width === 800 && height === 800)        score += 13;
  else if (width >= 900 && width <= 1200)         score += 8;

  // ── White background (20 pts) ─────────────────────────────────────────────
  if (hasWhiteBg) score += 20;

  // ── Brightness (5 pts) ────────────────────────────────────────────────────
  if (isBright) score += 5;

  return Math.min(100, Math.round(score));
}

/**
 * Get a human-readable label and colour for a score.
 */
function scoreLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: 'green' };
  if (score >= 70) return { label: 'Good',      color: 'blue'  };
  if (score >= 55) return { label: 'Fair',       color: 'amber' };
  return              { label: 'Poor',       color: 'red'   };
}

/**
 * Estimate shipping cost savings vs. baseline (unoptimised image).
 * Based on Meesho's standard 0.5 kg slab rate of ~₹45.
 * An image with score >= 80 typically lands in the lowest weight slab.
 */
function estimateSavings(score) {
  if (score >= 85) return { slab: '0–500g', saving: '₹20–35 per shipment' };
  if (score >= 70) return { slab: '500g–1kg', saving: '₹10–20 per shipment' };
  if (score >= 55) return { slab: '1–2kg', saving: '₹0–10 per shipment' };
  return              { slab: '2kg+',   saving: 'No saving' };
}

module.exports = { calcShippingScore, scoreLabel, estimateSavings };
