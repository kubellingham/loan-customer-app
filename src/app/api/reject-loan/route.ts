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

    // 1. Get loan info
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, customer_id")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found" },
        { status: 404 }
      );
    }

    // 2. Reject the loan
    const { error: rejectError } = await supabase
      .from("loans")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (rejectError) {
      return NextResponse.json(
        { success: false, error: rejectError.message },
        { status: 500 }
      );
    }

    // 3. Count rejections today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: rejectedLoans, error: countError } =
      await supabase
        .from("loans")
        .select("id")
        .eq("customer_id", loan.customer_id)
        .eq("status", "rejected")
        .gte("rejected_at", todayStart.toISOString());

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    // 4. If 2 or more rejections today → suspend customer
    if (rejectedLoans && rejectedLoans.length >= 2) {
      await supabase
        .from("customers")
        .update({ state: "suspended" })
        .eq("id", loan.customer_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
