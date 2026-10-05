import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createSession } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required"
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    // Find user
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      );
    }

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      );
    }

    const token = await createSession(user._id.toString());

const cookieStore = await cookies();

cookieStore.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/"
});

return Response.json({
  success: true,
  message: "Login successful",
  user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  }
});
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "Login failed"
      },
      { status: 500 }
    );
  }
}
