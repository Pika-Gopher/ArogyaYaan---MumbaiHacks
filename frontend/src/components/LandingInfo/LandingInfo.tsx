"use client";

import React, { useState } from "react";
import { Clipboard, Rocket, MessageCircle, Link2 } from "lucide-react";
import Image from "next/image";

const HowItWorksComponent = () => {
  const [activeTab, setActiveTab] = useState("predict");

  const tabs = [
    {
      id: "predict",
      label: "Predict",
      icon: <Clipboard className="w-8 h-8" />,
      title: "Predict Stockout Risk",
      description:
        "The AI engine consumes real-time inventory levels, localized epidemiological data, and consumption rates to accurately forecast stockouts 2-4 weeks in advance. This defines the problem.",
      quote:
        "This platform ensures that data from every facility reaches us in a consistent and reliable format, feeding the prediction engine.",
      author: "Dr. Aruna",
      role: "District Health Officer",
      image: "/images/how-capture.png",
    },
    {
      id: "recommend",
      label: "Recommend",
      icon: <Rocket className="w-8 h-8" />,
      title: "Formulate Optimal Solution",
      description:
        "The multi-agent system (LangGraph) reasons through the network to identify the ideal 'Donor PHC' with surplus, calculates logistics, and proposes the entire solution on a 'Solution Card'.",
      quote:
        "Prioritization has become far more efficient. We no longer rely on manual logs; the AI provides a complete, rationalized fix.",
      author: "Dr. Sameer",
      role: "District Operations Lead",
      image: "/images/why-not.png",
    },
    {
      id: "automate",
      label: "Automate",
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Execute One-Click Automation",
      description:
        "The DHO's 'Approve' click triggers the n8n workflow, which autonomously generates the digital gate pass, notifies donor/receiver staff, and schedules transport logistics.",
      quote:
        "The transfer workflow is instantaneous. Field teams receive actionable SMS alerts immediately without phone calls or manual paperwork.", 
      author: "Meera Naik",
      role: "Senior Field Coordinator",
      image: "/images/sucks-to.png",
    },
    {
      id: "verify",
      label: "Verify",
      icon: <Link2 className="w-8 h-8" />,
      title: "Confirm Chain-of-Custody",
      description:
        "Using the PHC Mobile App, staff verify stock transfer via a QR code handshake. The system updates the central inventory only upon final acceptance, preventing loss and ensuring accuracy.", 
      quote:
        "Centralised insights help us understand district-wide performance and prepare accurate reports, knowing that stock verification is digitally enforced.",
      author: "Rahul Patil",
      role: "Data & Analytics Officer",
      image: "/images/hopeful-ways.png",
    },
  ];

  const activeContent = tabs.find((t) => t.id === activeTab)!;

  const quoteColor =
    activeTab === "predict"
    ? "#1868DB"
    : activeTab === "recommend"
    ? "#82B536"
    : activeTab === "automate"
    ? "#FCA700"
    : "#BF63F4";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16 bg-white">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold inline-flex items-center gap-2">
          How it works
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <path
              d="M10 25 Q 15 15, 25 15 T 40 25"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
              </marker>
            </defs>
          </svg>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-44 h-24 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white border-2 border-gray-900 shadow-md"
                : "bg-gray-100 border-2 border-transparent hover:border-gray-300"
            }`}
          >
            <div
              className={`mb-2 ${
                activeTab === tab.id ? "text-yellow-500" : "text-blue-600"
              }`}
            >
              {tab.icon}
            </div>
            <span className="font-semibold text-gray-900">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex gap-8 items-start">
        {/* Left Content */}
        <div className="w-2/5">
          <h3 className="text-4xl font-bold mb-6">{activeContent.title}</h3>

          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            {activeContent.description}
          </p>

          {/* Quote Box */}
          <div className="rounded-lg p-6 relative"
               style={{ backgroundColor: `${quoteColor}15` }}>
            <div className="absolute -left-4 top-6">
              <svg
                className="w-16 h-16"
                style={{ color: quoteColor }}
                viewBox="0 0 40 40"
                fill="currentColor"
              >
                <path d="M8 24c0-4.4 3.6-8 8-8V8c-8.8 0-16 7.2-16 16h8zm20 0c0-4.4 3.6-8 8-8V8c-8.8 0-16 7.2-16 16h8z" />
              </svg>
            </div>

            <p className="text-gray-800 mb-4 pl-8 italic">
              {activeContent.quote}
            </p>

            <div className="pl-8">
              <p className="font-semibold text-gray-900">
                {activeContent.author}
              </p>
              <p className="text-sm text-gray-600">{activeContent.role}</p>
            </div>
          </div>
        </div>

        {/* Right Image with Decorative Shape */}
        <div className="w-3/5 relative">
          <div
    className="absolute inset-0 rounded-tl-3xl transform -rotate-6"
    style={{
      backgroundColor:
        activeTab === "predict"
          ? "#1868DB"
          : activeTab === "recommend"
          ? "#82B536"
          : activeTab === "automate"
          ? "#FCA700"
          : "#BF63F4",
    }}
  ></div>

  <div className="relative z-10 bg-white rounded-lg shadow-2xl overflow-hidden transform rotate-1">
    <Image
      src={activeContent.image}
      alt={activeContent.title}
      width={600}
      height={400}
      className="w-full h-auto"
    />
  </div>

  {/* Arrow decoration */}
  <div className="absolute -bottom-8 -left-8 z-20">
    <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
      <path
        d="M 20 20 Q 30 60, 70 70"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        markerEnd="url(#arrowhead2)"
      />
      <defs>
        <marker
          id="arrowhead2"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksComponent;
