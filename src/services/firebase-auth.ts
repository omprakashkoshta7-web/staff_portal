import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import STAFF_API_CONFIG from "../config/api.config";

const STAFF_TOKEN_KEY = "staffToken";
const STAFF_USER_KEY  = "staff_user";
const STAFF_TEAM_KEY  = "staff_selected_team"; // ← persists the team the user picked

export type StaffTeam = "ops" | "support" | "finance" | "marketing";

const VALID_TEAMS: StaffTeam[] = ["ops", "support", "finance", "marketing"];

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

/** Resolve team: prefer explicitly stored selected team, then staffProfile, then fallback */
function resolveTeam(
  selectedTeam: StaffTeam | null,
  profileTeam: StaffTeam | undefined,
  fallback: StaffTeam
): StaffTeam {
  if (selectedTeam && VALID_TEAMS.includes(selectedTeam)) return selectedTeam;
  if (profileTeam  && VALID_TEAMS.includes(profileTeam))  return profileTeam;
  return fallback;
}

const mapStaffUser = (
  user: VerifyUser,
  team: StaffTeam
): StaffAuthUser => ({
  uid: user.firebaseUid || user._id,
  email: user.email || "",
  displayName: user.name || undefined,
  role: user.role === "admin" ? "admin" : "staff",
  team,
  permissions: user.staffProfile?.permissions || [],
  scopes: user.staffProfile?.scopes || [],
});

// ─── Storage helpers ──────────────────────────────────────────────────────────

export const setStoredSession = (
  token: string,
  user: VerifyUser,
  team: StaffTeam
) => {
  // Always overwrite the team key first so it's available even before user JSON is written
  localStorage.setItem(STAFF_TEAM_KEY, team);
  localStorage.setItem(STAFF_TOKEN_KEY, token);

  const userWithTeam: VerifyUser = {
    ...user,
    staffProfile: {
      team,
      permissions: user.staffProfile?.permissions || [],
      scopes:      user.staffProfile?.scopes      || [],
    },
  };
  localStorage.setItem(STAFF_USER_KEY, JSON.stringify(userWithTeam));
};

export const clearStoredSession = () => {
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_USER_KEY);
  localStorage.removeItem(STAFF_TEAM_KEY);
};

export const getStoredToken = (): string | null =>
  localStorage.getItem(STAFF_TOKEN_KEY);

export const getStoredTeam = (): StaffTeam | null => {
  const t = localStorage.getItem(STAFF_TEAM_KEY);
  return t && VALID_TEAMS.includes(t as StaffTeam) ? (t as StaffTeam) : null;
};

// ─── Token exchange ───────────────────────────────────────────────────────────

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
    user?: VerifyUser;
    token?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Staff login failed");
  }

  const token = payload.data?.token ?? (payload as any).token;
  let user: VerifyUser = payload.data?.user ?? (payload as any).user;

  if (!token) throw new Error("Staff session token was not returned by the server");

  if (!user) {
    user = {
      _id: "staff_user",
      email: "",
      role: "staff",
      staffProfile: { team: "ops", permissions: [], scopes: [] },
    };
  }

  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("This Firebase account is not approved for staff access");
  }

  return { user, token };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginWithFirebase = async (
  email: string,
  password: string,
  selectedTeam: StaffTeam          // ← the team the user clicked on the login page
): Promise<{ user: StaffAuthUser; token: string }> => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase login is not configured for this staff app");
  }

  try {
    // Persist the selected team BEFORE Firebase sign-in so that
    // onAuthStateChanged (which fires during signIn) can read it immediately.
    localStorage.setItem(STAFF_TEAM_KEY, selectedTeam);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseIdToken = await userCredential.user.getIdToken();
    const { user, token } = await exchangeFirebaseToken(firebaseIdToken);

    // Store session with the selected team (overrides whatever backend returned)
    setStoredSession(token, user, selectedTeam);

    return { user: mapStaffUser(user, selectedTeam), token };
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

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    clearStoredSession();
  }
};

// ─── Session sync (app load / refresh) ───────────────────────────────────────

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

    const storedToken   = getStoredToken();
    const storedTeam    = getStoredTeam();          // ← read the persisted team key
    const storedUserRaw = localStorage.getItem(STAFF_USER_KEY);

    // ── Restore from storage ──────────────────────────────────────────────────
    if (storedToken && storedUserRaw) {
      try {
        const storedUser: VerifyUser = JSON.parse(storedUserRaw);

        // Priority: STAFF_TEAM_KEY > staffProfile.team > "ops"
        const team = resolveTeam(
          storedTeam,
          storedUser.staffProfile?.team,
          "ops"
        );

        onAuthenticated({ user: mapStaffUser(storedUser, team), token: storedToken });
        return;
      } catch {
        // Corrupted storage — fall through to re-exchange
      }
    }

    // ── Re-exchange Firebase token ────────────────────────────────────────────
    try {
      const firebaseIdToken = await firebaseUser.getIdToken();
      const { user, token } = await exchangeFirebaseToken(firebaseIdToken);

      // Use the persisted selected team if available, else staffProfile, else "ops"
      const team = resolveTeam(
        storedTeam,
        user.staffProfile?.team,
        "ops"
      );

      setStoredSession(token, user, team);
      onAuthenticated({ user: mapStaffUser(user, team), token });
    } catch {
      clearStoredSession();
      await signOut(auth).catch(() => undefined);
      onUnauthenticated();
    }
  });
