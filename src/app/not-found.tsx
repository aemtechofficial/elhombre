import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 sm:px-8 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <p className="label-mono text-ash">ERROR · 404</p>
      <h1 className="font-display font-black tracking-[-0.05em] leading-[0.85] text-[clamp(4rem,18vw,14rem)]">
        LOST<span className="text-outline">PAGE</span>
      </h1>
      <p className="mt-6 max-w-sm text-sm text-coal/70">
        This page doesn't exist in black or white. Let's get you back to
        something real.
      </p>
      <Link href="/" className="btn-block btn-dark mt-10">
        <ArrowLeft size={16} /> Back to home
      </Link>
    </main>
  );
}
