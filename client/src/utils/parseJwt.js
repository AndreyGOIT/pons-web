// client/src/utils/parseJwt.js
// Utility function to parse JWT token

function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const base64Url = parts[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");

    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}
export default parseJwt;
