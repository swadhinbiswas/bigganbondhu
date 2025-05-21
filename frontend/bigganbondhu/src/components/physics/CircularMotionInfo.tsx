import React from "react";

interface CircularMotionProps {
  mass: number;
  radius: number;
  speed: number;
  language: "en" | "bn";
}

/**
 * A component that displays explanatory information about the circular motion simulation
 */
const CircularMotionInfo: React.FC<CircularMotionProps> = ({
  mass,
  radius,
  speed,
  language,
}) => {
  // Calculate the values
  const centripetalForce = (mass * speed * speed) / radius;
  const centripetalAcceleration = (speed * speed) / radius;
  const period = (2 * Math.PI * radius) / speed;

  // Text translations
  const text = {
    en: {
      title: "Uniform Circular Motion",
      description:
        "Uniform circular motion occurs when an object moves in a circle with constant speed. A force directed toward the center of the circle is required to maintain this motion.",
      forceTitle: "Centripetal Force",
      forceDesc:
        "The force that makes an object follow a circular path points toward the center of the circle.",
      forceEquation: `F = m×v²/r = ${centripetalForce.toFixed(2)} N`,
      accTitle: "Centripetal Acceleration",
      accDesc:
        "The acceleration of an object in circular motion points toward the center of the circle.",
      accEquation: `a = v²/r = ${centripetalAcceleration.toFixed(2)} m/s²`,
      periodTitle: "Period",
      periodDesc: "The time taken to complete one full revolution.",
      periodEquation: `T = 2πr/v = ${period.toFixed(2)} s`,
      parameters: {
        mass: `Mass: ${mass} kg`,
        radius: `Radius: ${radius} m`,
        speed: `Speed: ${speed} m/s`,
      },
    },
    bn: {
      title: "সমবৃত্তাকার গতি",
      description:
        "সমবৃত্তাকার গতি তখন ঘটে যখন কোনো বস্তু সমান গতিতে বৃত্তের মধ্যে চলতে থাকে। এই গতি বজায় রাখার জন্য বৃত্তের কেন্দ্রের দিকে একটি বল প্রয়োজন।",
      forceTitle: "কেন্দ্রাভিমুখী বল",
      forceDesc:
        "যে বলের কারণে বস্তু বৃত্তাকার পথে চলে, তা বৃত্তের কেন্দ্রের দিকে নির্দেশিত হয়।",
      forceEquation: `F = m×v²/r = ${centripetalForce.toFixed(2)} N`,
      accTitle: "কেন্দ্রাভিমুখী ত্বরণ",
      accDesc:
        "বৃত্তাকার গতিতে থাকা বস্তুর ত্বরণ বৃত্তের কেন্দ্রের দিকে নির্দেশিত হয়।",
      accEquation: `a = v²/r = ${centripetalAcceleration.toFixed(2)} m/s²`,
      periodTitle: "পর্যায়কাল",
      periodDesc: "একটি সম্পূর্ণ আবর্তন সম্পন্ন করতে যে সময় লাগে।",
      periodEquation: `T = 2πr/v = ${period.toFixed(2)} s`,
      parameters: {
        mass: `ভর: ${mass} kg`,
        radius: `ব্যাসার্ধ: ${radius} m`,
        speed: `গতি: ${speed} m/s`,
      },
    },
  };

  const t = text[language];

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
        {t.title}
      </h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">{t.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400">
            {t.forceTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.forceDesc}
          </p>
          <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded text-center">
            {t.forceEquation}
          </div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <h3 className="font-semibold text-green-700 dark:text-green-400">
            {t.accTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.accDesc}
          </p>
          <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded text-center">
            {t.accEquation}
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
          <h3 className="font-semibold text-purple-700 dark:text-purple-400">
            {t.periodTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t.periodDesc}
          </p>
          <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded text-center">
            {t.periodEquation}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <span className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.parameters.mass}
        </span>
        <span className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.parameters.radius}
        </span>
        <span className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.parameters.speed}
        </span>
      </div>
    </div>
  );
};

export default CircularMotionInfo;
