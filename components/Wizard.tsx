"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  devices,
  getFaultsForCategory,
  getFaultsForDevice,
  getRepairCost,
} from "@/data";
import type { Category, Device, Fault } from "@/data/types";
import type { Condition } from "@/lib/verdict";
import { resultHref } from "@/lib/wizardState";

type Step = "category" | "device" | "fault" | "condition" | "diy" | "generic";

interface Props {
  initialCategory?: Category;
  initialDeviceId?: string;
  initialFaultId?: string;
}

const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: "good", label: "Good", hint: "Only this fault; otherwise clean and working." },
  { value: "worn", label: "Worn", hint: "Visible wear, minor issues, but solid." },
  { value: "poor", label: "Poor", hint: "Rough shape — other problems too." },
];

export function Wizard({ initialCategory, initialDeviceId, initialFaultId }: Props) {
  const router = useRouter();
  const initialDevice = initialDeviceId
    ? devices.find((d) => d.id === initialDeviceId)
    : undefined;

  const [step, setStep] = useState<Step>(
    initialFaultId && initialDevice
      ? "condition"
      : initialDevice
        ? "fault"
        : initialCategory
          ? "device"
          : "category",
  );
  const [category, setCategory] = useState<Category | null>(
    initialDevice?.category ?? initialCategory ?? null,
  );
  const [device, setDevice] = useState<Device | null>(initialDevice ?? null);
  const [selectedFaults, setSelectedFaults] = useState<Fault[]>(() => {
    const f = initialFaultId
      ? getFaultsForCategory(initialDevice?.category ?? "phone").find(
          (x) => x.id === initialFaultId,
        )
      : undefined;
    return f ? [f] : [];
  });
  const [condition, setCondition] = useState<Condition | null>(null);
  const [query, setQuery] = useState("");

  // Generic-fallback fields.
  const [genPrice, setGenPrice] = useState("");
  const [genAge, setGenAge] = useState("");

  const deviceFaults = useMemo(
    () =>
      device
        ? getFaultsForDevice(device.id)
        : category
          ? getFaultsForCategory(category)
          : [],
    [device, category],
  );

  const filteredDevices = useMemo(() => {
    const list = category ? devices.filter((d) => d.category === category) : devices;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) =>
      `${d.brand} ${d.name}`.toLowerCase().includes(q),
    );
  }, [category, query]);

  function toggleFault(f: Fault) {
    setSelectedFaults((prev) =>
      prev.some((x) => x.id === f.id)
        ? prev.filter((x) => x.id !== f.id)
        : [...prev, f],
    );
  }

  function faultHasDiy(f: Fault): boolean {
    if (!device) return f.diySkillLevel !== "not-recommended";
    const cost = getRepairCost(device.id, f.id);
    return !!cost?.diyPartsUSD;
  }

  // DIY only changes the verdict when *every* selected fault can be DIY'd, so we
  // only bother asking in that case.
  const allFaultsDiy =
    selectedFaults.length > 0 && selectedFaults.every(faultHasDiy);

  function finishListed(cond: Condition, diy: boolean) {
    if (!device || selectedFaults.length === 0) return;
    router.push(
      resultHref({
        mode: "listed",
        device: device.id,
        faults: selectedFaults.map((f) => f.id),
        cond,
        diy,
      }),
    );
  }

  function finishGeneric(cond: Condition, diy: boolean) {
    if (!category || selectedFaults.length === 0) return;
    router.push(
      resultHref({
        mode: "generic",
        category,
        price: Number(genPrice) || 0,
        age: Number(genAge) || 0,
        faults: selectedFaults.map((f) => f.id),
        cond,
        diy,
      }),
    );
  }

  // ---- Steps ----------------------------------------------------------------

  return (
    <div className="mx-auto max-w-xl">
      <StepDots step={step} />

      {step === "category" && (
        <Card title="What kind of device?">
          <div className="grid grid-cols-2 gap-3">
            {(["phone", "laptop"] as Category[]).map((c) => (
              <BigButton
                key={c}
                onClick={() => {
                  setCategory(c);
                  setDevice(null);
                  setSelectedFaults([]);
                  setStep("device");
                }}
              >
                <span className="text-2xl" aria-hidden>
                  {c === "phone" ? "📱" : "💻"}
                </span>
                <span className="capitalize">{c}</span>
              </BigButton>
            ))}
          </div>
        </Card>
      )}

      {step === "device" && (
        <Card title="Which device?" onBack={() => setStep("category")}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. iPhone 13, ThinkPad…"
            className="mb-3 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {filteredDevices.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDevice(d);
                  setCategory(d.category);
                  setSelectedFaults([]);
                  setStep("fault");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:border-accent hover:bg-accent-soft"
              >
                <span>
                  <span className="text-ink/50">{d.brand}</span> {d.name}
                </span>
                <span aria-hidden className="text-ink/30">›</span>
              </button>
            ))}
            {filteredDevices.length === 0 && (
              <p className="px-1 py-2 text-sm text-ink/50">No matches.</p>
            )}
          </div>
          <button
            onClick={() => setStep("generic")}
            className="mt-3 text-sm text-accent underline"
          >
            My device isn&apos;t listed →
          </button>
        </Card>
      )}

      {step === "generic" && (
        <Card title="Tell us about your device" onBack={() => setStep("device")}>
          <p className="mb-3 text-sm text-ink/60">
            We&apos;ll give a rough estimate from launch price and age.
          </p>
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-ink/70">Approx. launch price (USD)</span>
            <input
              type="number"
              value={genPrice}
              onChange={(e) => setGenPrice(e.target.value)}
              placeholder="e.g. 699"
              className="w-full rounded-lg border border-black/15 px-3 py-2"
            />
          </label>
          <label className="mb-4 block text-sm">
            <span className="mb-1 block text-ink/70">Age (years)</span>
            <input
              type="number"
              value={genAge}
              onChange={(e) => setGenAge(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-lg border border-black/15 px-3 py-2"
            />
          </label>
          <PrimaryButton
            disabled={!genPrice || !genAge}
            onClick={() => {
              setDevice(null);
              setSelectedFaults([]);
              setStep("fault");
            }}
          >
            Continue
          </PrimaryButton>
        </Card>
      )}

      {step === "fault" && (
        <Card
          title="What's wrong with it?"
          onBack={() => setStep(device ? "device" : "generic")}
        >
          <p className="mb-3 text-sm text-ink/60">
            Pick everything that&apos;s wrong — we&apos;ll total up the cost of
            fixing all of it.
          </p>
          <div className="space-y-1.5">
            {deviceFaults.map((f) => {
              const checked = selectedFaults.some((x) => x.id === f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleFault(f)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    checked
                      ? "border-accent bg-accent-soft"
                      : "border-black/10 hover:border-accent hover:bg-accent-soft"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded border text-xs ${
                      checked
                        ? "border-accent bg-accent text-white"
                        : "border-black/25"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium">{f.label}</span>
                    <span className="text-xs text-ink/50">{f.descriptionShort}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <PrimaryButton
              disabled={selectedFaults.length === 0}
              onClick={() => setStep("condition")}
            >
              {selectedFaults.length > 1
                ? `Continue with ${selectedFaults.length} faults`
                : "Continue"}
            </PrimaryButton>
          </div>
        </Card>
      )}

      {step === "condition" && selectedFaults.length > 0 && (
        <Card
          title="Apart from that, the device is…"
          onBack={() => setStep("fault")}
        >
          <div className="space-y-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setCondition(c.value);
                  if (allFaultsDiy) {
                    setStep("diy");
                  } else if (device) {
                    finishListed(c.value, false);
                  } else {
                    finishGeneric(c.value, false);
                  }
                }}
                className="flex w-full flex-col rounded-lg border border-black/10 px-3 py-3 text-left hover:border-accent hover:bg-accent-soft"
              >
                <span className="font-medium">{c.label}</span>
                <span className="text-xs text-ink/50">{c.hint}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === "diy" && selectedFaults.length > 0 && condition && (
        <Card
          title="Would you attempt a DIY repair?"
          onBack={() => setStep("condition")}
        >
          <p className="mb-3 text-sm text-ink/60">
            {selectedFaults.length > 1 ? "These repairs are" : "This fault is"} rated{" "}
            <strong className="text-ink/80">{hardestSkill(selectedFaults)}</strong> to
            fix yourself. If you&apos;re handy, DIY parts can change the verdict.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <BigButton
              onClick={() =>
                device
                  ? finishListed(condition, true)
                  : finishGeneric(condition, true)
              }
            >
              👍 Yes, I&apos;d DIY
            </BigButton>
            <BigButton
              onClick={() =>
                device
                  ? finishListed(condition, false)
                  : finishGeneric(condition, false)
              }
            >
              🛠️ No, a shop
            </BigButton>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---- little UI helpers ------------------------------------------------------

function Card({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="rounded-md px-2 py-1 text-ink/50 hover:bg-black/5"
          >
            ‹
          </button>
        )}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function BigButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 px-4 py-6 text-sm font-medium hover:border-accent hover:bg-accent-soft"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}

const SKILL_ORDER: Fault["diySkillLevel"][] = [
  "easy",
  "moderate",
  "hard",
  "not-recommended",
];

/** The toughest DIY skill level among the selected faults (for the warning text). */
function hardestSkill(faults: Fault[]): string {
  return faults.reduce((h, f) =>
    SKILL_ORDER.indexOf(f.diySkillLevel) > SKILL_ORDER.indexOf(h.diySkillLevel)
      ? f
      : h,
  ).diySkillLevel;
}

const STEP_ORDER: Step[] = ["category", "device", "fault", "condition", "diy"];

function StepDots({ step }: { step: Step }) {
  const idx = step === "generic" ? 1 : STEP_ORDER.indexOf(step);
  return (
    <div className="mb-4 flex items-center justify-center gap-1.5">
      {STEP_ORDER.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i <= idx ? "w-6 bg-accent" : "w-3 bg-black/15"
          }`}
        />
      ))}
    </div>
  );
}
