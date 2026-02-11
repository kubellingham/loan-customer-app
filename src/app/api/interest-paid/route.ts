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
        { success: false, error: "Loan ID required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 1. Get current loan
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

    // 2. Check if already at maximum interest
    if (loan.monthly_interest >= 21) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum loan period reached. Full repayment required.",
        },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 3. Calculate next interest
    let nextInterest = 18;
    if (loan.monthly_interest === 18) {
      nextInterest = 21;
    }

    // 4. Extend due date by 30 days from CURRENT due date
    const oldDue = new Date(loan.due_date);
    oldDue.setDate(oldDue.getDate() + 30);

    const newDueDate = oldDue.toISOString();

    // 5. Increment interest count
    const newCount = (loan.interest_paid_count || 0) + 1;

    // 6. Update loan
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        monthly_interest: nextInterest,
        due_date: newDueDate,
        interest_paid_count: newCount,
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Interest recorded. Loan moved to next stage.",
      },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
