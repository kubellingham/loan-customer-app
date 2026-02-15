import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json({ success: false });
    }

    // Get loan details
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, amount, total_repayment, customer_id")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json({
        success: false,
        error: "Loan not found",
      });
    }

    // Close loan
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "closed",
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
      });
    }

    // Record repayment
    const { error: txError } = await supabase
      .from("finance_transactions")
      .insert({
        type: "loan_repayment",
        amount: loan.total_repayment,
        customer_id: loan.customer_id,
        note: "Loan repaid",
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
