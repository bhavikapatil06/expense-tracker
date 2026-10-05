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