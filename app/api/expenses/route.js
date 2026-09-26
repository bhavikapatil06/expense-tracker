import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const expenses = await db
      .collection("expenses")
      .find({})
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
    const expense = await request.json();

    const client = await clientPromise;
    const db = client.db("expense_tracker");

    const result = await db
      .collection("expenses")
      .insertOne({
        description: expense.description,
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date
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