import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming loan body:", body);

    const { customerId, amount, totalRepayment } = body;

    const { error, data } = await supabase.from("loans").insert({
      customer_id: customerId,
      amount,
      total_repayment: totalRepayment,
      status: "pending",
      base_interest: 15,
    });

    if (error) {
      console.error("Supabase loan insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Loan inserted:", data);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Create loan error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
