import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json({ success: false });
    }

    // Get loan details first
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, amount, customer_id")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json({
        success: false,
        error: "Loan not found",
      });
    }

    const now = new Date();
    const approvedAt = now.toISOString();

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    // Update loan
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "active",
        approved_at: approvedAt,
        due_date: dueDate.toISOString(),
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
      });
    }

    // Create finance transaction (loan out)
    const { error: txError } = await supabase
      .from("finance_transactions")
      .insert({
        type: "loan_out",
        amount: loan.amount,
        customer_id: loan.customer_id,
        note: "Loan disbursed",
      });

    if (txError) {
      return NextResponse.json({
        success: false,
        error: txError.message,
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
