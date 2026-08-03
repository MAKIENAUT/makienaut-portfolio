export const ORB_WEAVER_SESSION_COOKIE = "orbw_session";
export const ORB_WEAVER_SESSION_MAX_AGE = 60 * 60 * 12;

const issuer = "orb-weaver";
const audience = "orb-weaver-backoffice";
const encoder = new TextEncoder();

interface SessionPayload {
  sub: string;
  role: "ADMIN" | "USER";
  iat: number;
  exp: number;
  iss: typeof issuer;
  aud: typeof audience;
}

const encodeBase64Url = (value: string | Uint8Array) => {
  const bytes =
    typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const getSigningKey = async () => {
  const secret = process.env.ORBW_AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ORBW_AUTH_SECRET must be configured with at least 32 characters."
    );
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
};

export const createOrbWeaverSession = async (user: {
  id: string;
  role: "ADMIN" | "USER";
}) => {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  );
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + ORB_WEAVER_SESSION_MAX_AGE,
    iss: issuer,
    aud: audience,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const unsignedToken = `${header}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    encoder.encode(unsignedToken)
  );

  return `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;
};

export const verifyOrbWeaverSession = async (token?: string) => {
  if (!token || token.length > 2048) {
    return false;
  }

  try {
    const [header, encodedPayload, signature] = token.split(".");

    if (!header || !encodedPayload || !signature) {
      return false;
    }

    const parsedHeader = JSON.parse(decodeBase64Url(header)) as {
      alg?: string;
      typ?: string;
    };

    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") {
      return false;
    }

    const unsignedToken = `${header}.${encodedPayload}`;
    const signatureBytes = Uint8Array.from(
      atob(
        signature
          .replaceAll("-", "+")
          .replaceAll("_", "/")
          .padEnd(
            signature.length + ((4 - (signature.length % 4)) % 4),
            "="
          )
      ),
      (character) => character.charCodeAt(0)
    );
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      await getSigningKey(),
      signatureBytes,
      encoder.encode(unsignedToken)
    );

    if (!isValidSignature) {
      return false;
    }

    const payload = JSON.parse(
      decodeBase64Url(encodedPayload)
    ) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    return (
      typeof payload.sub === "string" &&
      payload.sub.length > 0 &&
      (payload.role === "ADMIN" || payload.role === "USER") &&
      payload.iss === issuer &&
      payload.aud === audience &&
      typeof payload.iat === "number" &&
      payload.iat <= now + 60 &&
      typeof payload.exp === "number" &&
      payload.exp > now
    );
  } catch {
    return false;
  }
};
