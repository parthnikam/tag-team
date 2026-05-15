"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#475467] transition-colors hover:text-[#0A0A0A]"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
