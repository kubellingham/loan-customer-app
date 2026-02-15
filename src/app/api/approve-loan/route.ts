import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json(
        { success: false, error: "Missing loanId" },
        { status: 400 }
      );
    }

    // Get loan info
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, amount")
      .eq("id", loanId)
      .single();

    console.log("Loan fetch:", loan, fetchError);

    if (fetchError || !loan) {
      return NextResponse.json({
        success: false,
        error: fetchError?.message || "Loan not found",
      });
    }

    const now = new Date();
    const approvedAt = now.toISOString();

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const totalRepayment = Math.round(loan.amount * 1.15);

    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "active",
        approved_at: approvedAt,
        due_date: dueDate.toISOString(),
        total_repayment: totalRepayment,
      })
      .eq("id", loanId);

    console.log("Update error:", updateError);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
