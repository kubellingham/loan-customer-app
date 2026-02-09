import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customerId, amount, totalRepayment } =
      await req.json();

    const { error } = await supabase.from("loans").insert({
      customer_id: customerId,
      amount,
      total_repayment: totalRepayment,
      status: "pending",
      base_interest: 15,
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
