/**
 * Freelancer Marketplace — API Layer
 * Base API URL constant used by all backend requests.
 */
const API_BASE = "https://freelancer-marketplace-rpki.onrender.com/api";

/**
 * Standard API Request wrapper.
 * Attaches Authorization header if user token exists.
 * Sends real HTTP fetch calls directly to the REST API server.
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("gigora_token");
  
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
