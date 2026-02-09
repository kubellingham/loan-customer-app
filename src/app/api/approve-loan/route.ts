import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (!loanId) {
      return NextResponse.json(
        { success: false, error: "Loan ID required" },
        { status: 400 }
      );
    }

    const now = new Date();

    // 30 days due date
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    // 90 days final deadline
    const finalDeadline = new Date(now);
    finalDeadline.setDate(finalDeadline.getDate() + 90);

    const { error } = await supabase
      .from("loans")
      .update({
        status: "active",
        approved_at: now.toISOString(),
        due_date: dueDate.toISOString(),
        final_deadline: finalDeadline.toISOString(),
      })
      .eq("id", loanId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
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
