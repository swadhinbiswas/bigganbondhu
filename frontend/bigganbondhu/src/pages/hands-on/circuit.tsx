import { useState } from "react";
import { useNavigate } from "react-router-dom";

import P5CircuitSimulator from "@/components/physics/circuit/P5CircuitSimulator";
import DefaultLayout from "@/layouts/default";

const MODES = [
  { key: "series" as "series", label: "সিরিজ", icon: "🔗" },
  { key: "parallel" as "parallel", label: "প্যারালাল", icon: "🔀" },
  { key: "free" as "free", label: "ফ্রি", icon: "🆓" },
  { key: "challenge" as "challenge", label: "চ্যালেঞ্জ", icon: "🏆" },
];

const CHALLENGES = [
  {
    key: "series20",
    label: "সিরিজ: মোট রেজিস্টেন্স ২০Ω",
    challenge: {
      mode: "series" as "series" | "parallel" | "free",
      totalResistance: 20,
      description: "সিরিজ সংযোগে মোট রেজিস্টেন্স ২০Ω করুন।",
    },
  },
  {
    key: "parallel5",
    label: "প্যারালাল: মোট রেজিস্টেন্স ৫Ω",
    challenge: {
      mode: "parallel" as "series" | "parallel" | "free",
      totalResistance: 5,
      description: "প্যারালাল সংযোগে মোট রেজিস্টেন্স ৫Ω করুন।",
    },
  },
  {
    key: "led-circuit",
    label: "LED সার্কিট",
    challenge: {
      mode: "series" as "series" | "parallel" | "free",
      totalResistance: 220,
      description:
        "একটি ব্যাটারি, একটি LED, এবং একটি ২২০Ω রেজিস্টর দিয়ে সার্কিট তৈরি করুন।",
    },
  },
  {
    key: "complex-parallel",
    label: "জটিল প্যারালাল",
    challenge: {
      mode: "parallel" as "series" | "parallel" | "free",
      totalResistance: 3.33,
      description:
        "প্যারালাল সংযোগে ১০Ω, ১০Ω, ও ১০Ω রেজিস্টর দিয়ে সার্কিট তৈরি করুন। (৩.৩৩Ω হওয়া উচিত)",
    },
  },
];

export default function CircuitDesignPage() {
  const [mode, setMode] = useState<
    "series" | "parallel" | "free" | "challenge"
  >("free");
  const [showCurrent, setShowCurrent] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState(
    CHALLENGES[0].challenge,
  );
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(10);
  const [challengeResult, setChallengeResult] = useState<
    "success" | "error" | "warning" | null
  >(null);
  const navigate = useNavigate();

  const handleReset = () => {
    setResetKey((k) => k + 1);
  };

  // Save/load/export logic
  const handleSave = () => {
    try {
      const canvasState = document.querySelector("canvas")?.toDataURL();

      localStorage.setItem(
        "circuit-sim-state",
        JSON.stringify({
          key: resetKey,
          mode,
          voltage,
          resistance,
          showCurrent,
          timestamp: Date.now(),
          canvasState,
        }),
      );
      alert("সার্কিট সংরক্ষণ করা হয়েছে!");
    } catch (err) {
      alert("সার্কিট সংরক্ষণ করতে ব্যর্থ হয়েছে!");
      console.error(err);
    }
  };

  const handleLoad = () => {
    const data = localStorage.getItem("circuit-sim-state");

    if (data) {
      try {
        const savedState = JSON.parse(data);

        setResetKey(savedState.key || 0);
        setMode(savedState.mode || "free");
        setVoltage(savedState.voltage || 6);
        setResistance(savedState.resistance || 10);
        setShowCurrent(
          savedState.showCurrent !== undefined ? savedState.showCurrent : true,
        );

        alert("সংরক্ষিত সার্কিট লোড হয়েছে!");
      } catch (err) {
        alert("সংরক্ষিত সার্কিট লোড করতে ব্যর্থ হয়েছে!");
        console.error(err);
      }
    } else {
      alert("কোনো সংরক্ষিত সার্কিট পাওয়া যায়নি।");
    }
  };

  const handleExport = () => {
    const el = document.querySelector("canvas");

    if (el && el instanceof HTMLCanvasElement) {
      try {
        const url = el.toDataURL("image/png");
        const a = document.createElement("a");

        a.href = url;
        a.download = `circuit-design-${Date.now()}.png`;
        a.click();
      } catch (err) {
        alert("এক্সপোর্ট সম্ভব নয়।");
        console.error(err);
      }
    } else {
      alert("এক্সপোর্ট সম্ভব নয়। ক্যানভাস পাওয়া যায়নি।");
    }
  };

  const handleChallengeResult = (result: "success" | "error" | "warning") => {
    setChallengeResult(result);

    // Show a celebration animation for success
    if (result === "success") {
      // Could add confetti animation here
      setTimeout(() => {
        setChallengeResult(null);
      }, 3000);
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto py-8 px-2 font-sans">
        <button
          className="mb-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
          onClick={() => navigate("/hands-on")}
        >
          ← হ্যান্ডস-অন এক্সপেরিয়েন্সে ফিরে যান
        </button>
        <h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight">
          সার্কিট ডিজাইন
        </h1>
        <p className="text-center text-lg text-gray-500 dark:text-gray-300 mb-6 font-medium">
          সার্কিট তৈরি করুন, রিসাইজ করুন, ওহমের সূত্র, সিরিজ ও প্যারালাল সংযোগ
          শিখুন
        </p>

        {/* Toolbar with new design */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 sm:p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4">
            {MODES.map((m) => (
              <button
                key={m.key}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold border transition text-sm sm:text-base shadow-sm touch-optimized-button
                  ${mode === m.key ? "bg-blue-600 text-white border-blue-700" : "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-gray-700"}`}
                title={m.label}
                onClick={() => setMode(m.key)}
              >
                <span>{m.icon}</span> {m.label}
                {m.key === "challenge" && (
                  <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                    নতুন
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border transition shadow-sm
                ${showCurrent ? "bg-green-600 text-white border-green-700" : "bg-white dark:bg-gray-800 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-gray-700"}`}
              title="কারেন্ট প্রবাহ টগল করুন"
              onClick={() => setShowCurrent((v) => !v)}
            >
              ⚡ {showCurrent ? "কারেন্ট দেখান" : "কারেন্ট লুকান"}
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border border-red-400 bg-white dark:bg-gray-800 text-red-700 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/30 transition shadow-sm"
              title="রিসেট"
              onClick={handleReset}
            >
              ♻️ রিসেট
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border border-blue-400 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition shadow-sm"
              title="সংরক্ষণ"
              onClick={handleSave}
            >
              💾 সংরক্ষণ
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border border-blue-400 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition shadow-sm"
              title="লোড"
              onClick={handleLoad}
            >
              📂 লোড
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border border-purple-400 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition shadow-sm"
              title="এক্সপোর্ট"
              onClick={handleExport}
            >
              🖼️ এক্সপোর্ট
            </button>
          </div>

          {/* Parameter controls */}
          <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ভোল্টেজ (V)
              </label>
              <div className="flex">
                <button
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600"
                  onClick={() => setVoltage(Math.max(1, voltage - 1))}
                >
                  -
                </button>
                <input
                  className="w-16 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  max="24"
                  min="1"
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                />
                <button
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600"
                  onClick={() => setVoltage(Math.min(24, voltage + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                রেজিস্ট্যান্স (Ω)
              </label>
              <div className="flex">
                <button
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600"
                  onClick={() => setResistance(Math.max(1, resistance - 5))}
                >
                  -
                </button>
                <input
                  className="w-16 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  max="1000"
                  min="1"
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                />
                <button
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600"
                  onClick={() => setResistance(Math.min(1000, resistance + 5))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions with better design */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-800 rounded-lg px-6 py-4 flex items-center gap-4 shadow-sm max-w-2xl w-full">
            <span className="text-3xl hidden sm:block">💡</span>
            <div>
              <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">
                টিপস
              </h3>
              <ul className="text-gray-700 dark:text-gray-200 text-sm sm:text-base list-disc pl-4 space-y-1">
                <li>কম্পোনেন্ট যোগ করতে বাটনের ব্যবহার করুন</li>
                <li>ড্র্যাগ করে সার্কিট বোর্ডে রাখুন</li>
                <li>কম্পোনেন্ট রিসাইজ করতে ধরে টানুন</li>
                <li>
                  <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                    R
                  </kbd>{" "}
                  চেপে কম্পোনেন্ট ঘুরান
                </li>
                <li>সুইচ on/off করতে ক্লিক করুন</li>
                <li>Alt চেপে কম্পোনেন্টে ক্লিক করে সংযোগ করুন</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Challenge selector with improved design */}
        {mode === "challenge" && (
          <div className="mb-6 flex flex-col items-center bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 shadow-sm">
            <span className="mb-2 font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/60 px-3 py-1 rounded-full flex items-center gap-2 text-base">
              🏆 চ্যালেঞ্জ মোড
            </span>
            <select
              className="px-4 py-2 rounded-lg border border-yellow-400 bg-white dark:bg-gray-800 text-yellow-900 dark:text-yellow-200 font-semibold mb-2"
              value={CHALLENGES.findIndex(
                (c) => c.challenge === selectedChallenge,
              )}
              onChange={(e) =>
                setSelectedChallenge(
                  CHALLENGES[parseInt(e.target.value)].challenge,
                )
              }
            >
              {CHALLENGES.map((c, i) => (
                <option key={c.key} value={i}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="mt-2 text-yellow-800 dark:text-yellow-200 text-center font-medium">
              {selectedChallenge.description}
            </div>

            {challengeResult && (
              <div
                className={`mt-3 px-4 py-2 rounded-lg font-medium ${
                  challengeResult === "success"
                    ? "bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200"
                    : challengeResult === "warning"
                      ? "bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200"
                      : "bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200"
                }`}
              >
                {challengeResult === "success"
                  ? "👏 অভিনন্দন! চ্যালেঞ্জ সফল হয়েছে!"
                  : challengeResult === "warning"
                    ? "⚠️ সার্কিট অসম্পূর্ণ! আরও প্রয়োজনীয় কম্পোনেন্ট যোগ করুন।"
                    : "❌ সার্কিট সঠিক নয়। আবার চেষ্টা করুন!"}
              </div>
            )}
          </div>
        )}

        {/* Simulator Card with improved design */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mb-8 border border-blue-100 dark:border-blue-800">
          <P5CircuitSimulator
            key={resetKey}
            challenge={mode === "challenge" ? selectedChallenge : undefined}
            mode={mode}
            resistance={resistance}
            showCurrent={showCurrent}
            showLabels={true}
            voltage={voltage}
            onChallengeResult={handleChallengeResult}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
