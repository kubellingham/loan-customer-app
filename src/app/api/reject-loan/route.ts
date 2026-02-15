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

    // Get the loan
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("customer_id")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Reject the loan
    await supabase
      .from("loans")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    const today = new Date().toISOString().split("T")[0];

    // Get customer
    const { data: customer } = await supabase
      .from("customers")
      .select("rejection_count, last_rejection_date")
      .eq("id", loan.customer_id)
      .single();

    let newCount = 1;

    if (
      customer?.last_rejection_date === today
    ) {
      newCount = (customer.rejection_count || 0) + 1;
    }

    // Update customer
    const updates: any = {
      rejection_count: newCount,
      last_rejection_date: today,
    };

    // Suspend after 2 rejections in one day
    if (newCount >= 2) {
      updates.state = "suspended";
    }

    await supabase
      .from("customers")
      .update(updates)
      .eq("id", loan.customer_id);

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
