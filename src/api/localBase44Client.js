import usersSeed from "./seedData/users.json";
import startupsSeed from "./seedData/startups.json";
import internshipsSeed from "./seedData/internships.json";
import applicationsSeed from "./seedData/applications.json";
import shortlistsSeed from "./seedData/shortlists.json";
import notificationsSeed from "./seedData/notifications.json";

const nowIso = () => new Date().toISOString();
const SESSION_STATE_KEY = "qstp_local_backend_v1";
const SESSION_TOKEN_KEY = "qstp_local_backend_token";

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const seedState = () => {
  const created = nowIso();
  const startupId = "startup_demo_001";
  const internshipId = "internship_demo_001";

  return {
    currentToken: null,
    users: deepClone(usersSeed),
    authTokens: {},
    entities: {
      Startup: deepClone(startupsSeed),
      Internship: deepClone(internshipsSeed),
      Application: deepClone(applicationsSeed),
      Shortlist: deepClone(shortlistsSeed),
      Notification: deepClone(notificationsSeed),
    },
    meta: {
      created,
      startupId,
      internshipId,
    },
  };
};

let inMemoryState = null;
let currentToken = null;

const readSessionState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writeSessionState = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to persist the auth session state", error);
  }
};

const readSessionToken = () => {
  if (typeof window === "undefined") return currentToken;
  try {
    return window.sessionStorage.getItem(SESSION_TOKEN_KEY) || currentToken;
  } catch {
    return currentToken;
  }
};

const writeSessionToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    if (!token) {
      window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return;
    }
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.warn("Unable to persist the auth token", error);
  }
};

const normalizeStore = (state) => {
  const next = state || {};
  next.users = Array.isArray(next.users) ? next.users : [];
  next.authTokens = next.authTokens && typeof next.authTokens === "object" ? next.authTokens : {};
  next.entities = next.entities && typeof next.entities === "object" ? next.entities : {};
  next.currentToken = next.currentToken || currentToken || null;
  return next;
};

const loadState = async () => {
  if (!inMemoryState) {
    const persistedState = readSessionState();
    inMemoryState = normalizeStore(persistedState || seedState());
    currentToken = inMemoryState.currentToken || readSessionToken() || null;
  }

  return normalizeStore(inMemoryState);
};

const saveState = async (state) => {
  const nextState = normalizeStore(state);
  inMemoryState = nextState;
  currentToken = nextState.currentToken || readSessionToken() || null;
  writeSessionState(nextState);
  writeSessionToken(currentToken);
};

const withState = async (fn) => {
  const state = normalizeStore(await loadState());
  const result = await fn(state);
  await saveState(state);
  return result;
};

const ensureEntityBucket = (state, entityName) => {
  if (!Array.isArray(state.entities[entityName])) {
    state.entities[entityName] = [];
  }
  return state.entities[entityName];
};

const getCurrentToken = () => currentToken || readSessionToken();

const setCurrentToken = (token) => {
  currentToken = token || null;
  writeSessionToken(currentToken);
  if (inMemoryState) {
    inMemoryState.currentToken = currentToken;
    writeSessionState(inMemoryState);
  }
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role || "student",
  name: user.name || user.email,
  created_date: user.created_date,
});

const findUserByToken = (state, token) => {
  if (!token) return null;
  const userId = state.authTokens[token];
  if (!userId) return null;
  return state.users.find((user) => user.id === userId) || null;
};

const issueToken = (state, user) => {
  const token = makeId("token");
  state.authTokens[token] = user.id;
  setCurrentToken(token);
  return token;
};

const makeAuthError = (message, status = 401) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const applySortAndLimit = (items, sort = "-created_date", limit = 100) => {
  const sorted = [...items];
  if (sort) {
    const isDesc = sort.startsWith("-");
    const key = isDesc ? sort.slice(1) : sort;
    sorted.sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? (isDesc ? -1 : 1) : (isDesc ? 1 : -1);
    });
  }
  return sorted.slice(0, Math.max(0, limit ?? 100));
};

const matchesFilter = (item, filter = {}) =>
  Object.entries(filter).every(([key, value]) => {
    if (Array.isArray(value)) return value.includes(item?.[key]);
    return item?.[key] === value;
  });

const createEntityClient = (entityName) => ({
  async list(sort = "-created_date", limit = 100) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      return deepClone(applySortAndLimit(bucket, sort, limit));
    });
  },

  async filter(filter = {}, sort = "-created_date", limit = 100) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      const filtered = bucket.filter((item) => matchesFilter(item, filter));
      return deepClone(applySortAndLimit(filtered, sort, limit));
    });
  },

  async get(id) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      const item = bucket.find((entry) => entry.id === id);
      if (!item) throw makeAuthError(`${entityName} not found`, 404);
      return deepClone(item);
    });
  },

  async create(payload = {}) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      const created = nowIso();
      const record = {
        ...payload,
        id: payload.id || makeId(entityName.toLowerCase()),
        created_date: payload.created_date || created,
        updated_date: created,
      };
      if (entityName === "Application" && !record.status) {
        record.status = "applied";
      }
      if (entityName === "Startup" && !record.status) {
        record.status = "pending";
      }
      bucket.push(record);

      if (entityName === "Application") {
        const notifications = ensureEntityBucket(state, "Notification");
        notifications.push({
          id: makeId("notification"),
          title: "Application submitted",
          message: `Your application for ${record.internship_title || "an internship"} was submitted.`,
          recipient_role: "student",
          read: false,
          created_date: created,
          updated_date: created,
        });
      }

      return deepClone(record);
    });
  },

  async update(id, patch = {}) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      const index = bucket.findIndex((entry) => entry.id === id);
      if (index === -1) throw makeAuthError(`${entityName} not found`, 404);
      bucket[index] = {
        ...bucket[index],
        ...patch,
        id,
        updated_date: nowIso(),
      };
      return deepClone(bucket[index]);
    });
  },

  async delete(id) {
    return withState((state) => {
      const bucket = ensureEntityBucket(state, entityName);
      const index = bucket.findIndex((entry) => entry.id === id);
      if (index === -1) throw makeAuthError(`${entityName} not found`, 404);
      const [deleted] = bucket.splice(index, 1);
      return deepClone(deleted);
    });
  },
});

const entities = new Proxy(
  {},
  {
    get: (_, entityName) => createEntityClient(String(entityName)),
  }
);

const auth = {
  async isAuthenticated() {
    return withState((state) => Boolean(findUserByToken(state, getCurrentToken())));
  },

  async me() {
    return withState((state) => {
      const user = findUserByToken(state, getCurrentToken());
      if (!user) throw makeAuthError("Authentication required", 401);
      return publicUser(user);
    });
  },

  async register({ email, password }) {
    return withState((state) => {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!normalizedEmail || !password) throw makeAuthError("Email and password are required", 400);
      const existing = state.users.find((user) => user.email === normalizedEmail);
      if (existing) throw makeAuthError("An account with this email already exists", 409);

      const otpCode = "123456";
      state.users.push({
        id: makeId("user"),
        email: normalizedEmail,
        password,
        role: "student",
        name: normalizedEmail.split("@")[0],
        verified: false,
        otpCode,
        created_date: nowIso(),
      });

      return { success: true };
    });
  },

  async verifyOtp({ email, otpCode }) {
    return withState((state) => {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = state.users.find((entry) => entry.email === normalizedEmail);
      if (!user) throw makeAuthError("Account not found", 404);
      if (user.verified) throw makeAuthError("Email already verified", 400);
      if (String(user.otpCode || "") !== String(otpCode || "")) throw makeAuthError("Invalid verification code", 400);

      user.verified = true;
      delete user.otpCode;
      const token = issueToken(state, user);
      return { access_token: token, token_type: "bearer" };
    });
  },

  async resendOtp(email) {
    return withState((state) => {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = state.users.find((entry) => entry.email === normalizedEmail);
      if (!user) throw makeAuthError("Account not found", 404);
      if (user.verified) throw makeAuthError("Email already verified", 400);
      user.otpCode = "123456";
      return { success: true };
    });
  },

  setToken(token) {
    setCurrentToken(token);
  },

  async loginViaEmailPassword(email, password) {
    return withState((state) => {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = state.users.find((entry) => entry.email === normalizedEmail);
      if (!user || user.password !== password) throw makeAuthError("Invalid email or password", 401);
      if (!user.verified) throw makeAuthError("Please verify your email before logging in", 403);
      const token = issueToken(state, user);
      return { access_token: token, token_type: "bearer" };
    });
  },

  async loginWithProvider(provider, returnTo = "/") {
    if (provider !== "google") throw makeAuthError("Only google provider is supported in local mode", 400);

    await withState((state) => {
      let user = state.users.find((entry) => entry.email === "google.user@local.dev");
      if (!user) {
        user = {
          id: makeId("user"),
          email: "google.user@local.dev",
          password: null,
          role: "student",
          name: "Google User",
          verified: true,
          created_date: nowIso(),
        };
        state.users.push(user);
      }
      issueToken(state, user);
      return null;
    });

    if (typeof window !== "undefined") {
      window.location.href = returnTo || "/";
    }
  },

  async resetPasswordRequest(email) {
    return withState((state) => {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = state.users.find((entry) => entry.email === normalizedEmail);
      if (user) {
        user.resetToken = makeId("reset");
        user.reset_requested_at = nowIso();
      }
      return { success: true };
    });
  },

  async resetPassword({ resetToken, newPassword }) {
    return withState((state) => {
      const token = String(resetToken || "").trim();
      const user = state.users.find((entry) => entry.resetToken === token);
      if (!user) throw makeAuthError("Invalid or expired reset token", 400);
      if (!newPassword) throw makeAuthError("New password is required", 400);
      user.password = newPassword;
      delete user.resetToken;
      delete user.reset_requested_at;
      return { success: true };
    });
  },

  async logout(returnTo) {
    await withState((state) => {
      const token = getCurrentToken();
      if (token) {
        delete state.authTokens[token];
      }
      state.currentToken = null;
      return null;
    });
    setCurrentToken(null);

    if (returnTo && typeof window !== "undefined") {
      const destination = `/login?returnTo=${encodeURIComponent(returnTo)}`;
      window.location.href = destination;
    }
  },

  redirectToLogin(returnTo) {
    if (typeof window === "undefined") return;
    const destination = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    window.location.href = destination;
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      if (!file) throw makeAuthError("No file provided", 400);
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(makeAuthError("Failed to read file", 400));
        reader.readAsDataURL(file);
      });
      return { file_url: dataUrl };
    },
  },
};

export const db = { auth, entities, integrations };
export const base44 = db;

if (!globalThis.__B44_DB__) {
  globalThis.__B44_DB__ = db;
}

export default db;
