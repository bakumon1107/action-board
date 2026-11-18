import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-4 z-50 w-full flex justify-center h-16">
      <div className="px-4 w-full flex justify-between items-center text-sm bg-white border-b border-b-foreground/10 mx-4 rounded-2xl ">
        <div className="flex gap-5 items-center font-semibold min-w-[60px]">
          <Link href="/map/poster" className="flex items-center gap-4">
            <Image
              src="/img/logo_shiro.png"
              alt="logo"
              width={48}
              height={48}
            />
            <div className="text-lg">ポスターマップ</div>
          </Link>
        </div>
        {user ? (
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              ログアウト
            </Button>
          </form>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-md border px-3 py-2 text-sm font-semibold"
          >
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
}
