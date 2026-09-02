/**
 * Centralized API module for the Mern-CRUD client.
 * All backend calls go through here so we have one place to manage
 * the base URL, headers, error handling, and retry logic.
 */

const BackendURL = process.env.REACT_APP_BACKENDURL || "http://localhost:5500";

/* ------------------------------------------------------------------ */
/*  Generic request helper                                            */
/* ------------------------------------------------------------------ */

async function request(endpoint, { method = "GET", body, headers = {} } = {}) {
  const url = `${BackendURL}${endpoint}`;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Status / Health                                                   */
/* ------------------------------------------------------------------ */

/**
 * Check if the backend server is reachable and the DB is connected.
 * Returns the full /api/status payload:
 *  {
 *    status: "success" | "error",
 *    message: string,
 *    data: { database, db_Name, ping, uptime, collections, documents, ... }
 *  }
 *
 * Unlike other request helpers, this returns error responses too (e.g. 503 when
 * the DB is down) so callers can display the status without catching.
 */
export async function checkServerStatus() {
  const url = `${BackendURL}/api/status`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    // The caller intentionally reads error bodies (e.g. 503 with DB status),
    // so we return the payload regardless of res.ok.
    if (!res.ok) {
      return { status: "error", message: data?.message || `HTTP ${res.status}`, data: data?.data ?? null };
    }
    return data;
  } catch {
    return { status: "error", message: "Server unreachable", data: null };
  }
}

/**
 * Lightweight connectivity check — just tries to reach the backend root.
 * Resolves to true/false.
 */
export async function isServerReachable() {
  try {
    await fetch(BackendURL, { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Products                                                          */
/* ------------------------------------------------------------------ */

/** Get all products */
export async function getProducts() {
  return request("/api/products");
}

/** Get a single product by ID */
export async function getProduct(id) {
  return request(`/api/products/${id}`);
}

/** Create a new product */
export async function createProduct({ name, price }) {
  return request("/api/products", {
    method: "POST",
    body: { name, price },
  });
}

/** Update an existing product */
export async function updateProduct(id, { name, price }) {
  return request(`/api/products/${id}`, {
    method: "PUT",
    body: { name, price },
  });
}

/** Delete a product */
export async function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: "DELETE",
  });
}

/* ------------------------------------------------------------------ */
/*  Heartbeat (DB keep-alive)                                         */
/* ------------------------------------------------------------------ */

export async function sendHeartbeat() {
  return request("/api/db-heartbeat");
}

/* ------------------------------------------------------------------ */
/*  Export the base URL for any edge cases                            */
/* ------------------------------------------------------------------ */

export { BackendURL };
