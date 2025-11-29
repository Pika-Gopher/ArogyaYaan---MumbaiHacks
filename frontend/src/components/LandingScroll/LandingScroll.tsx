"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    key: "intelligence",
    title: "Hyper-Local Demand Intelligence",
    description:
      "Move beyond reactive systems. Our AI engine uses localized epidemiological data, consumption rates, and weather patterns to forecast stockouts 2-4 weeks in advance, turning foresight into planning.",
    color: "#1868DB",
    image: "/images/alerts.jpg",
  },
  {
    key: "orchestration",
    title: "Autonomous Supply Orchestration",
    description:
      "The multi-agent system autonomously identifies the donor PHC with surplus and calculates the optimal inter-facility stock transfer, resolving shortages in hours via a single 'Solution Card' approval.",
    color: "#82B536",
    image: "/images/network.png",
  },
  {
    key: "visibility",
    title: "Ecosystem Command Center",
    description: "Provide DHOs and administrators with the real-time, geospatial visibility into the entire medicine supply chain, ensuring rapid, audit-ready response to systemic risks and failures.",
    color: "#FCA700",
    image: "/images/reports.png",
  },
];

export default function ScrollShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
  const sections = document.querySelectorAll(".scroll-trigger");

  const onScroll = () => {
    let current = 0;

    sections.forEach((sec, index) => {
      const el = sec as HTMLElement;
      const top = el.offsetTop;
      const height = el.offsetHeight;

      if (window.scrollY >= top && window.scrollY < top + height) {
        current = index;
      }
    });

    setActiveIndex(Math.min(current, SECTIONS.length - 1));
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);

  const item = SECTIONS[activeIndex];

  return (
    <div className="relative w-full min-h-[350vh] bg-gray-50">
      {/* Sticky viewport */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center px-10 overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Discover our greatest strengths
          </h1>
          <p className="text-gray-600 text-lg">
            A system of intelligence that perceives, reasons, and acts to build a resilient public health supply chain.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-16 w-full max-w-7xl items-center">

          {/* LEFT IMAGE + DECORATIVE BACKGROUND */}
          <div className="relative w-full h-[60vh] flex items-center justify-center">

            {/* Decorative corner lines - top left */}
            <motion.div
              className="absolute -top-6 -left-6 w-16 h-16 z-30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-900"></div>
              <div className="absolute top-0 left-0 w-0.5 h-full bg-gray-900"></div>
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-gray-400 rotate-12"></div>
            </motion.div>

            {/* Colored vertical bar - left side */}
            <motion.div
              key={item.key + "-left-bar"}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute left-0 top-0 w-3 h-full origin-top z-20"
              style={{ backgroundColor: item.color }}
            />

            {/* Colored horizontal bar - bottom */}
            <motion.div
              key={item.key + "-bottom-bar"}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute left-0 bottom-0 w-full h-3 origin-left z-20"
              style={{ backgroundColor: item.color }}
            />

            {/* Layered gradient background */}
            <motion.div
              key={item.key + "-layer1"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
                boxShadow: `0 0 60px ${item.color}40`,
              }}
            />

            {/* MAIN IMAGE with white background */}
            <AnimatePresence mode="wait">
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full z-10 flex items-center justify-center p-6"
              >
                <div className="relative w-full h-full bg-white shadow-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                  />
                  {/* Cursor icon overlay */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute top-1/3 left-1/4 z-20"
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className="drop-shadow-xl"
                    >
                      <path 
                        d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" 
                        fill="black"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* RIGHT TEXT */}
          <motion.div
            key={item.key + "-text"}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 pr-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              {item.title}
            </h2>

            <p className="text-gray-600 text-xl leading-relaxed">
              {item.description}
            </p>
          </motion.div>

        </div>
      </div>

      {/* Invisible scroll triggers */}
      {SECTIONS.map((_, i) => (
        <div 
          key={i} 
          className={`scroll-trigger ${
            i === 0
            ? "h-screen"
            : i === SECTIONS.length - 1
            ? "h-screen"
            : "h-screen"
          }`} 
        ></div>
      ))}
    </div>
  );
}