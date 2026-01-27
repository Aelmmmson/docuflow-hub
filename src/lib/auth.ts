export const AUTH_KEY = "xdms-auth";

export function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch (e) {
    return false;
  }
}

export function login(username: string) {
  // lightweight local login placeholder
  try {
    localStorage.setItem(AUTH_KEY, "true");
    localStorage.setItem("xdms-user", username || "user");
  } catch (e) {
    // ignore
  }
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("xdms-user");
  } catch (e) {
    // ignore
  }
}

export function getUser() {
  try {
    return localStorage.getItem("xdms-user") || null;
  } catch (e) {
    return null;
  }
}
