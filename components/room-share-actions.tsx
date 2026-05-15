"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2 } from "lucide-react";

export default function RoomShareActions({
  code,
  roomPath,
}: {
  code: string;
  roomPath: string;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCopyCode = () => {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(code);

        setCopiedCode(true);

        setTimeout(() => {
          setCopiedCode(false);
        }, 2000);
      } catch {
        setMessage("Could not copy the meeting code.");
      }
    });
  };

  const handleShareLink = () => {
    startTransition(async () => {
      try {
        const roomUrl =
          typeof window === "undefined"
            ? roomPath
            : new URL(roomPath, window.location.origin).toString();

        await navigator.clipboard.writeText(roomUrl);
        setCopiedLink(true);
      } catch {
        setMessage("Could not copy the meeting link.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCopyCode}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7] disabled:opacity-50"
        >
          {copiedCode ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy code
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareLink}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-medium text-[#0A0A0A] transition-all duration-200 hover:bg-[#F7F7F7] disabled:opacity-50"
        >
          {copiedLink ? (
            <>
              <Check className="h-4 w-4" />
              Copied link
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Share link
            </>
          )}
        </button>
      </div>

      {message ? <p className="text-sm text-[#6B6B6B]">{message}</p> : null}
    </div>
  );
}
