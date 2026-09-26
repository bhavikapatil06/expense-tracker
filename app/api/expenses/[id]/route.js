import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid expense ID"
        },
        { status: 400 }
      );
    }

    const updatedExpense = await request.json();

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const result = await db.collection("expenses").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          description: updatedExpense.description,
          amount: Number(updatedExpense.amount),
          category: updatedExpense.category,
          date: updatedExpense.date
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Expense not found"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Expense updated successfully"
    });

  } catch (error) {
    console.error("MongoDB PUT error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update expense"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid expense ID"
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Expense not found"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("MongoDB DELETE error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete expense"
      },
      { status: 500 }
    );
  }
}