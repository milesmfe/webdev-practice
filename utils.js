exports.escapeHtml = function (unsafe) {
  if (typeof unsafe !== 'string') {
    // Ensure consistent handling for non-string types
    return unsafe === null || typeof unsafe === 'undefined' ? '' : String(unsafe);
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};