import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          message: "All fields are required"
        },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password must be at least 6 characters"
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Email already registered"
        },
        { status: 409 }
      );
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection("users").insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date()
    });

    return Response.json({
      success: true,
      message: "Registration successful",
      userId: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        message: "Registration failed"
      },
      { status: 500 }
    );
  }
}