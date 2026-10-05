import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
  throw new Error("Please add AUTH_SECRET to .env.local");
}

const secret = new TextEncoder().encode(secretKey);

export async function createSession(userId) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    console.log("NO SESSION COOKIE");
    return null;
  }

  const session = await verifySession(token);

  

  if (!session?.userId) {
    return null;
  }

  return session;
}