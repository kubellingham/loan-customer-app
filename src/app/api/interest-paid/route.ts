import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json(
        { success: false },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 1. Fetch current loan
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("*")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const currentInterest = loan.monthly_interest;
    const principal = loan.amount;

    // 2. Determine next interest tier
    let newInterest = currentInterest;

    if (currentInterest === 15) newInterest = 18;
    else if (currentInterest === 18) newInterest = 21;
    else newInterest = 21; // cap at 21%

    // 3. New due date = old due date + 30 days
    const oldDueDate = new Date(loan.due_date);
    const newDueDate = new Date(oldDueDate);
    newDueDate.setDate(newDueDate.getDate() + 30);

    // 4. Recalculate total repayment
    const newTotalRepayment = Math.round(
      principal + (principal * newInterest) / 100
    );

    // 5. Update loan
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        monthly_interest: newInterest,
        due_date: newDueDate.toISOString(),
        total_repayment: newTotalRepayment,
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
