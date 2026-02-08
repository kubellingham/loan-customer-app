import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customerId, plan, amount, totalRepayment } =
      await req.json();

    const { error } = await supabase.from("loans").insert({
      customer_id: customerId,
      plan_name: plan.name,
      duration_days: plan.duration,
      monthly_interest: plan.monthlyInterest,
      amount,
      total_repayment: totalRepayment,
      status: "pending",
    });

    if (error) {
      console.error("Loan insert error:", error);
      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create loan error:", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
