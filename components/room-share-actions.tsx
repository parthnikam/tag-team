"use client";

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";

export default function RoomShareActions({
  code,
}: {
  code: string;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
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


  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCopyCode}
          disabled={isPending}
          className="button-outset inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
        >
          {copiedCode ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy code
            </>
          )}
        </button>
      </div>

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
