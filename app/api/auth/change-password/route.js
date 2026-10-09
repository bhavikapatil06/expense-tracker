import { getCurrentUser } from "../../../../lib/auth";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(request) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        {
          success: false,
          message: "Current and new password are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        {
          success: false,
          message: "New password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return Response.json(
        {
          success: false,
          message: "New password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return Response.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      {
        _id: new ObjectId(session.userId),
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    return Response.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to change password.",
      },
      { status: 500 }
    );
  }
}
