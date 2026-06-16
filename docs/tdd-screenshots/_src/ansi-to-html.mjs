// Minimal ANSI SGR -> HTML converter, scoped to the codes real npm/vitest/
// playwright output actually uses (bold, dim, the 8 standard + 8 bright fg
// colors, and reset). Not a general-purpose terminal emulator.

const FG_COLORS = {
  30: "#1f2328",
  31: "#f47067",
  32: "#56d364",
  33: "#e3b341",
  34: "#6cb6ff",
  35: "#dcbdfb",
  36: "#39c5cf",
  37: "#d0d7de",
  90: "#6e7681",
  91: "#ff7b72",
  92: "#7ee787",
  93: "#f2cc60",
  94: "#79c0ff",
  95: "#d2a8ff",
  96: "#56d4dd",
  97: "#f6f8fa",
};

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function styleFor(state) {
  const styles = [];
  if (state.bold) styles.push("font-weight:600");
  if (state.dim) styles.push("opacity:0.6");
  if (state.color) styles.push(`color:${state.color}`);
  return styles.join(";");
}

/**
 * Converts a string containing ANSI SGR escape sequences into an HTML
 * fragment of <span> elements carrying equivalent inline styles.
 */
export function ansiToHtml(input) {
  const state = { bold: false, dim: false, color: null };
  let html = "";
  let lastIndex = 0;
  const pattern = /\x1b\[([0-9;]*)m/g;
  let match;

  function flush(text) {
    if (!text) return;
    const style = styleFor(state);
    const safe = escapeHtml(text);
    html += style ? `<span style="${style}">${safe}</span>` : safe;
  }

  while ((match = pattern.exec(input)) !== null) {
    flush(input.slice(lastIndex, match.index));
    lastIndex = pattern.lastIndex;

    const codes = match[1].length ? match[1].split(";").map(Number) : [0];
    for (const code of codes) {
      if (code === 0) {
        state.bold = false;
        state.dim = false;
        state.color = null;
      } else if (code === 1) {
        state.bold = true;
      } else if (code === 2) {
        state.dim = true;
      } else if (code === 22) {
        state.bold = false;
        state.dim = false;
      } else if (code === 39) {
        state.color = null;
      } else if (FG_COLORS[code]) {
        state.color = FG_COLORS[code];
      }
    }
  }
  flush(input.slice(lastIndex));
  return html;
}
