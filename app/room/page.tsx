"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function Page() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { signOut } = useAuth();

  const handleCreateRoom = async () => {
    setError("");

    try {
      const response = await fetch("/api/createroom", {
        method: "POST",
      });
      const data = await response.json();
      const roomCode = data?.room?.code;

      if (!response.ok || !roomCode) {
        setError(data.error ?? "Could not create room.");
        return;
      }

      router.push(`/room/${roomCode}`);
    } catch (err) {
      console.error(err);
      setError("Could not create room.");
    }
  };

  const handleJoinRoom = () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return;
    }

    startTransition(() => {
      router.push(`/room/${trimmedCode}`);
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded border border-white/10 p-4">
        <div>
          <h1 className="text-lg">Host or join a room</h1>
          <p className="text-sm text-white/60">Create a room or enter a code.</p>
        </div>

        <button
          type="button"
          onClick={handleCreateRoom}
          className="rounded border p-2 text-left text-sm"
        >
          Create room
        </button>

        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Room code"
          className="rounded border border-white/20 bg-transparent p-2 text-sm outline-none"
        />

        <button
          type="button"
          onClick={handleJoinRoom}
          disabled={!code.trim() || isPending}
          className="rounded border p-2 text-left text-sm disabled:opacity-50"
        >
          Join room
        </button>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button
          type="button"
          onClick={signOut}
          className="rounded border p-2 text-left text-sm"
        >
          signout
        </button>

      </div>
    </main>
  );
}
