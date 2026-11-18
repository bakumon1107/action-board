"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { signInAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SimpleSignInForm({
  returnUrl,
}: {
  returnUrl?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signInAction, null);

  useEffect(() => {
    if (state?.success && "redirectUrl" in state) {
      router.push(state.redirectUrl);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-4">
      {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}
      {state?.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}
