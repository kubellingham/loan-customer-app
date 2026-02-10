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
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const now = new Date();

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const finalDeadline = new Date(now);
    finalDeadline.setDate(finalDeadline.getDate() + 90);

    const { error } = await supabase
      .from("loans")
      .update({
        status: "rejected",
        approved_at: now.toISOString(),
        due_date: dueDate.toISOString(),
        final_deadline: finalDeadline.toISOString(),
      })
      .eq("id", loanId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
