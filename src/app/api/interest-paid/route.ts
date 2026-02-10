import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json({ success: false });
    }

    // Get current loan
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("*")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({
        success: false,
        error: "Loan not found",
      });
    }

    const now = new Date();

    // Determine next interest rate
    let nextInterest = 18;

    if (loan.monthly_interest === 18) {
      nextInterest = 21;
    }

    // New due date (30 days)
    const newDueDate = new Date(now);
    newDueDate.setDate(newDueDate.getDate() + 30);

    const { error } = await supabase
      .from("loans")
      .update({
        monthly_interest: nextInterest,
        approved_at: now.toISOString(),
        due_date: newDueDate.toISOString(),
      })
      .eq("id", loanId);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
