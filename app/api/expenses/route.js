import clientPromise from "../../../lib/mongodb";
import { getCurrentUser } from "../../../lib/auth";

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

    const expenses = await db
      .collection("expenses")
      .find({
        userId: session.userId
      })
      .toArray();

    const formattedExpenses = expenses.map((expense) => ({
      id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date
    }));

    return Response.json({
      success: true,
      expenses: formattedExpenses
    });
  } catch (error) {
    console.error("MongoDB GET error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch expenses"
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const expense = await request.json();

    // Validate required fields
    if (
      !expense.description ||
      !expense.category ||
      !expense.date ||
      expense.amount === undefined
    ) {
      return Response.json(
        {
          success: false,
          message: "All expense fields are required"
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = Number(expense.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json(
        {
          success: false,
          message: "Amount must be a valid number greater than 0"
        },
        { status: 400 }
      );
    }

    // Validate description
    if (expense.description.trim() === "") {
      return Response.json(
        {
          success: false,
          message: "Expense description cannot be empty"
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const result = await db
  .collection("expenses")
  .insertOne({
    description: expense.description.trim(),
    amount: amount,
    category: expense.category,
    date: expense.date,
    userId: session.userId
  });

    return Response.json({
      success: true,
      message: "Expense saved successfully!",
      expenseId: result.insertedId.toString()
    });
  } catch (error) {
    console.error("MongoDB POST error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to save expense"
      },
      { status: 500 }
    );
  }
}