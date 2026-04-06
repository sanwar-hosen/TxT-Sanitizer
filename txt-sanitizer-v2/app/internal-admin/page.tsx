"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function InternalAdminPage() {
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/internal-admin/session", { cache: "no-store" });
        const payload = (await response.json()) as { active?: boolean };
        setIsUnlocked(Boolean(payload.active));
      } catch {
        setIsUnlocked(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkSession();
  }, []);

  async function handleUnlock() {
    if (!passcodeInput.trim()) return;

    setErrorMessage("");
    const response = await fetch("/api/internal-admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passcode: passcodeInput }),
    });

    if (response.ok) {
      setIsUnlocked(true);
      setPasscodeInput("");
      return;
    }

    setErrorMessage("Invalid passcode.");
  }

  if (isChecking) {
    return (
      <section className="mx-auto max-w-xl rounded-xl border border-[#d4dce6] bg-white p-6 text-sm text-[#5b6b81]">
        Checking admin session...
      </section>
    );
  }

  if (!isUnlocked) {
    return (
      <section className="mx-auto max-w-xl rounded-xl border border-[#d4dce6] bg-white p-6">
        <h1 className="text-xl font-semibold text-[#1f2a37]">Admin Access</h1>
        <p className="mt-2 text-sm text-[#5b6b81]">Enter passcode to continue.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={passcodeInput}
            onChange={(event) => setPasscodeInput(event.target.value)}
            className="w-full rounded-md border border-[#cfd9e4] px-3 py-2 text-sm outline-none focus:border-[#0b5fcc] md:w-auto md:min-w-[280px]"
            placeholder="Passcode"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleUnlock();
              }
            }}
          />
          <button type="button" onClick={handleUnlock} className="btn-primary rounded-md px-4 py-2 text-sm font-semibold">
            Unlock
          </button>
        </div>
        {errorMessage ? <p className="mt-3 text-sm text-[#b42323]">{errorMessage}</p> : null}
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold text-[#1f2a37]">Admin Dashboard</h1>
      <AdminPanel />
    </section>
  );
}
