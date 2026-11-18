import Link from "next/link";
import SimpleSignInForm from "@/features/auth/components/simple-sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>
      <SimpleSignInForm returnUrl={returnUrl} />
      <Link
        href="/map/poster"
        className="mt-6 block text-center text-sm text-muted-foreground underline"
      >
        ログインせず地図を見る
      </Link>
    </div>
  );
}
