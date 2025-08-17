"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [showSpicy, setShowSpicy] = useState(false);
  const [showTrueFanz, setShowTrueFanz] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const spicyTimer = setTimeout(() => setShowSpicy(true), 1000);
    const trueFanzTimer = setTimeout(() => setShowTrueFanz(true), 3000);
    const buttonTimer = setTimeout(() => setShowButton(true), 4000);

    return () => {
      clearTimeout(spicyTimer);
      clearTimeout(trueFanzTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnter = () => {
    router.push("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center">
      {/* Logo Animation */}
      <motion.img
        src="/chilizgreen.png"
        alt="Chiliz Green Logo"
        initial={{ y: -100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-64 h-64 mb-6"
      />

{/* Spicy Text */}
{showSpicy && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-3xl md:text-5xl font-serif text-white mb-6 leading-snug"
  >
    When{" "}
    <span className="text-[rgb(205,28,24)] font-bold">Chiliz</span> meets fans,
    we turn spicy <span className="text-green-500 font-bold">green</span>
  </motion.p>
)}

{/* trueFanz Button */}
{showButton && (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    onClick={handleEnter}
    className="px-12 py-6 bg-[rgb(205,28,24)] rounded-2xl shadow-lg 
               transition-colors duration-300 hover:bg-green-500"
  >
    <span className="text-6xl md:text-7xl font-extrabold font-sans text-white tracking-wide">
      trueFanz
    </span>
  </motion.button>
)}
    </div>
  );
}