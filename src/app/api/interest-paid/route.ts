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
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // 1. Get current loan
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("due_date, final_deadline, monthly_interest")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found" },
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // 2. Extend from existing dates
    const newDue = new Date(loan.due_date);
    newDue.setDate(newDue.getDate() + 30);

    const newFinal = new Date(loan.final_deadline);
    newFinal.setDate(newFinal.getDate() + 30);

    // 3. Increase interest
    const newInterest = (loan.monthly_interest || 15) + 3;

    // 4. Update loan
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        due_date: newDue.toISOString(),
        final_deadline: newFinal.toISOString(),
        monthly_interest: newInterest,
      })
      .eq("id", loanId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
