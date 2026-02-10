import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json(
        { success: false, error: "Missing loanId" },
        { status: 400 }
      );
    }

    // Get current loan
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("monthly_interest, approved_at")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found" },
        { status: 500 }
      );
    }

    const now = new Date();

    // Move next cycle (30 days forward)
    const newApprovedAt = now.toISOString();

    const newDueDate = new Date(now);
    newDueDate.setDate(newDueDate.getDate() + 30);

    // Escalate interest
    let nextInterest = loan.monthly_interest;

    if (loan.monthly_interest === 15) nextInterest = 18;
    else if (loan.monthly_interest === 18) nextInterest = 21;

    const { error: updateError } = await supabase
      .from("loans")
      .update({
        monthly_interest: nextInterest,
        approved_at: newApprovedAt,
        due_date: newDueDate.toISOString(),
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
