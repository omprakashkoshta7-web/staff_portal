import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import STAFF_API_CONFIG from "../config/api.config";

const STAFF_TOKEN_KEY = "staffToken";
const STAFF_USER_KEY = "staff_user";

export type StaffTeam = "ops" | "support" | "finance" | "marketing";

type VerifyUser = {
  _id: string;
  firebaseUid?: string;
  email: string;
  name?: string;
  role: "staff" | "admin" | string;
  staffProfile?: {
    team?: StaffTeam;
    permissions?: string[];
    scopes?: string[];
  };
};

type VerifyResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user?: VerifyUser;
  };
};

export interface StaffAuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: "staff" | "admin";
  team: StaffTeam;
  permissions: string[];
  scopes: string[];
}

const mapStaffUser = (user: VerifyUser, fallbackTeam: StaffTeam): StaffAuthUser => ({
  uid: user.firebaseUid || user._id,
  email: user.email || "",
  displayName: user.name || undefined,
  role: user.role === "admin" ? "admin" : "staff",
  team: user.staffProfile?.team || fallbackTeam,
  permissions: user.staffProfile?.permissions || [],
  scopes: user.staffProfile?.scopes || [],
});

export const setStoredSession = (token: string, user: VerifyUser) => {
  localStorage.setItem(STAFF_TOKEN_KEY, token);
  localStorage.setItem(STAFF_USER_KEY, JSON.stringify(user));
};

export const clearStoredSession = () => {
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_USER_KEY);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(STAFF_TOKEN_KEY);
};

/**
 * Exchange a Firebase ID token for a backend JWT.
 *
 * Sends the Firebase token in the Authorization header (not the body),
 * as required by the /api/auth/verify spec.
 */
async function exchangeFirebaseToken(
  firebaseIdToken: string
): Promise<{ user: VerifyUser; token: string }> {
  const response = await fetch(
    `${STAFF_API_CONFIG.BASE_URL}${STAFF_API_CONFIG.ENDPOINTS.AUTH.VERIFY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({ role: "staff" }),
    }
  );

  const payload = (await response.json().catch(() => ({}))) as VerifyResponse & {
    // Handle legacy response shape where data is at root level
    user?: VerifyUser;
    token?: string;
  };

  if (!response.ok) {
    console.error("Token exchange failed:", { status: response.status, payload });
    throw new Error(payload.message || "Staff login failed");
  }

  // Support both { data: { token, user } } and legacy { token, user } shapes
  const token = payload.data?.token ?? (payload as any).token;
  let user = payload.data?.user ?? (payload as any).user;

  if (!token) {
    console.error("No token in response:", payload);
    throw new Error("Staff session token was not returned by the server");
  }

  // If user data is missing, create a default user object
  if (!user) {
    console.warn("No user data in response, creating default user object");
    user = {
      _id: "staff_user",
      email: "staff@speedcopy.com",
      role: "staff",
      name: "Staff User",
      staffProfile: {
        team: "ops",
        permissions: [],
        scopes: [],
      },
    };
  }

  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("This Firebase account is not approved for staff access");
  }

  return { user, token };
}

/**
 * Sign in with Firebase email/password, then exchange the Firebase ID token
 * for a short backend JWT. Stores the backend JWT — not the Firebase token.
 */
export const loginWithFirebase = async (
  email: string,
  password: string,
  fallbackTeam: StaffTeam
): Promise<{ user: StaffAuthUser; token: string }> => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase login is not configured for this staff app");
  }

  try {
    // Step 1: Firebase sign-in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Step 2: Get Firebase ID token (used only once)
    const firebaseIdToken = await userCredential.user.getIdToken();

    // Step 3: Exchange for backend JWT
    const { user, token } = await exchangeFirebaseToken(firebaseIdToken);

    // Step 4: Store the backend JWT (not the Firebase token)
    setStoredSession(token, user);

    return { user: mapStaffUser(user, fallbackTeam), token };
  } catch (error) {
    const authError = error as AuthError & { message?: string };

    if (authError.code === "auth/invalid-credential") {
      throw new Error(
        "Firebase rejected these credentials. Check the staff account in Firebase and try again."
      );
    }

    throw new Error(authError.message || "Staff login failed");
  }
};

/**
 * Sign out from Firebase and clear the stored backend JWT.
 */
export const logoutFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    clearStoredSession();
  }
};

/**
 * Sync the staff auth session on app load.
 *
 * On Firebase auth state change:
 * - If a user is present and a backend JWT is already stored, restore the session.
 * - If a user is present but no JWT, re-exchange the Firebase token.
 * - If no user, clear everything and call onUnauthenticated.
 */
export const syncStaffAuthSession = (
  onAuthenticated: (session: { user: StaffAuthUser; token: string }) => void,
  onUnauthenticated: () => void
) =>
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearStoredSession();
      onUnauthenticated();
      return;
    }

    // If we already have a backend JWT stored, restore the session from storage.
    const storedToken = getStoredToken();
    const storedUserRaw = localStorage.getItem(STAFF_USER_KEY);

    if (storedToken && storedUserRaw) {
      try {
        const storedUser: VerifyUser = JSON.parse(storedUserRaw);
        onAuthenticated({
          user: mapStaffUser(storedUser, storedUser.staffProfile?.team || "ops"),
          token: storedToken,
        });
        return;
      } catch {
        // Corrupted storage — fall through to re-exchange
      }
    }

    // No valid JWT stored — re-exchange the Firebase token.
    try {
      const firebaseIdToken = await firebaseUser.getIdToken();
      const { user, token } = await exchangeFirebaseToken(firebaseIdToken);
      setStoredSession(token, user);
      onAuthenticated({
        user: mapStaffUser(user, user.staffProfile?.team || "ops"),
        token,
      });
    } catch {
      clearStoredSession();
      await signOut(auth).catch(() => undefined);
      onUnauthenticated();
    }
  });
