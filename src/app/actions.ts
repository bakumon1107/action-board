"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export async function signInAction(
  _previousState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const returnUrl = formData.get("returnUrl")?.toString();

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const redirectUrl =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/map/poster";
  return { success: true, redirectUrl };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/map/poster");
}
