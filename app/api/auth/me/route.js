import { getCurrentUser } from "../../../../lib/auth";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.userId)
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to get user"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!name || !email) {
      return Response.json(
        {
          success: false,
          message: "Name and email are required"
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const existingUser = await db.collection("users").findOne({
      email,
      _id: { $ne: new ObjectId(session.userId) }
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Email is already in use"
        },
        { status: 409 }
      );
    }

    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(session.userId)
      },
      {
        $set: {
          name,
          email
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: session.userId,
        name,
        email
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update profile"
      },
      { status: 500 }
    );
  }
}