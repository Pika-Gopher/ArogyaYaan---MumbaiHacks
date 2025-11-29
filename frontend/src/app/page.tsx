"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Added axios

import ScrollShowcase from "../components/LandingScroll/LandingScroll";
import HowItWorksComponent from "../components/LandingInfo/LandingInfo";
import LandingChart from "../components/LandingChart/LandingChart";
import CTABanner from "../components/LandingBanner/LandingBanner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type HeaderProps = {
  onSignInClick: () => void;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Header Component
const Header = ({ onSignInClick }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1868DB] to-[#1868DB] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-[#1868DB] to-[#1868DB] bg-clip-text text-transparent">
            ArogyaYaan
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-gray-700 font-medium relative group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#1868DB] to-[#FCA700] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-gray-700 font-medium relative group"
          >
            How it Works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#1868DB] to-[#FCA700] group-hover:w-full transition-all duration-300"></span>
          </button>
        </nav>

        <button
          onClick={onSignInClick}
          className="bg-linear-to-r from-[#1868DB] to-[#1868DB] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Sign In
        </button>
      </div>
    </header>
  );
};

// Auth Modal Component (Now Integrated)
const AuthModal = ({ isOpen, onClose }: ModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", userType: "DHO" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Backend doesn't support public signup yet? Or implement similar to login
        // For now, let's just alert or mock it
        alert("Public registration is closed. Please contact your District Admin.");
        setLoading(false);
        return;
      }

      // --- LOGIN LOGIC ---
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;

      // 1. Store Credentials
      localStorage.setItem("token", token);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_district", user.district);
      localStorage.setItem("user_name", user.name);

      // 2. Redirect based on Role
      if (user.role === "DHO") {
        router.push("/dashboard"); 
      } else if (user.role === "PHC_Staff" || user.role === "PHC") {
        // Assuming staff goes to network or inventory page
        router.push("/phc"); 
      }

      // Close modal on success (though redirect will happen)
      onClose();

    } catch (err: any) {
      console.error("Login failed", err);
      const msg = err.response?.data?.error || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#dbd518] to-[#ffe600] p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          {/* Name (Only Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-[#1868DB] focus:border-transparent outline-none"
                placeholder="Enter your name"
              />
            </div>
          )}

          {/* User Type (Only for visual toggle in Sign In, logic handled by backend role) */}
          {/* We remove the select because the backend decides the role based on email */}
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-[#1868DB] focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>

            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-[#1868DB] focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-linear-to-r from-[#1868DB] to-[#0c49f3] text-white py-3 
                       rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] 
                       transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
                       flex justify-center items-center gap-2"
          >
            {loading ? (
               <>
                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                 Logging in...
               </>
            ) : (
               isSignUp ? "Sign Up" : "Sign In"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Stats Component
const StatsSection = () => {
  const stats = [
    { value: "18 Districts", label: "Coverage in Prototype Data", color: "#1868DB" },
    { value: "100+ Facilities", label: "PHCs & CHCs Mapped", color: "#82B536" },
    { value: "3 AI Models", label: "Predictive Rules Configured", color: "#FCA700" },
    { value: "2 Dashboards", label: "Operational Modules Built", color: "#BF63F4" },
  ];

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl font-bold mb-2" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Grid Component
const FeaturesGrid = () => {
  const features = [
  {
    icon: "📈",
    title: "Predictive Demand Forecasting",
    description:
      "AI models analyze consumption patterns, seasonality, and PHC-level data to predict stock requirements before shortages occur.",
    color: "#1868DB",
  },
  {
    icon: "⚙️",
    title: "Automated Logistics",
    description:
      "Streamline indent generation and redistribution workflows with one-click automation across the entire supply chain.",
    color: "#82B536",
  },
  {
    icon: "🚨",
    title: "Proactive Alerts & Risks",
    description:
      "Get early warnings on potential stockouts, overstocking, expiry exposure, and demand anomalies—before they escalate.",
    color: "#FCA700",
  },
  {
    icon: "🗺️",
    title: "Interactive PHC Network Map",
    description:
      "Monitor district-wide supply health with live status maps, critical stock insights, and granular PHC visibility.",
    color: "#BF63F4",
  },
  ];

  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-linear-to-r from-[#1868DB] to-[#BF63F4] bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600">Everything you need to manage your health journey</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
          {features.map((feature, index) => (
            <div key={index} className="relative group">
  {/* Decorative rotated shape behind the card */}
  <div
    className="absolute inset-0 transform -rotate-6 transition-all duration-300 group-hover:-rotate-3"
    style={{
      backgroundColor: feature.color,
    }}
  ></div>

  {/* Main foreground card */}
  <div
    className="
      relative z-10 p-8 rounded-2xl bg-white shadow-md border 
      transition-all duration-300 
      transform group-hover:-translate-y-2 group-hover:rotate-1
    "
  >
              <div className="text-4xl mb-4" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: feature.color }}>
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main HomePage Component
export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="w-full min-h-screen">
      <Header onSignInClick={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6 bg-linear-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#1868DB] opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#dbff12] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-100 left-40 w-45 h-45 bg-[#82B536] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#82B536] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-[#1868DB] to-[#1868DB] bg-clip-text text-transparent animate-[fadeIn_1s_ease-out]">
            Your Health Journey Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 animate-[fadeIn_1s_ease-out_0.3s_both]">
            Explore interactive dashboards, monitor your wellness, and generate actionable insights — all in one beautiful platform.
          </p>
          <div className="flex gap-4 justify-center animate-[fadeIn_1s_ease-out_0.6s_both]">
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="border-2 border-[#1868DB] text-[#1868DB] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#1868DB] hover:text-white transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <FeaturesGrid />
      
      <div className="w-full">
        <ScrollShowcase />
      </div>
      <StatsSection />
      <section className="w-full py-20 bg-white" id="how-it-works">
        <HowItWorksComponent />
      </section>

      <section className="w-full py-20 bg-gray-50">
        <LandingChart />
      </section>

      <section className="w-full py-20">
        <CTABanner />
      </section>

      <footer className="w-full bg-white text-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1868DB] to-[#0044ff] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Arogyayaan</span>
              </div>
              <p className="text-gray-400">Your trusted partner in health and wellness.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Arogyayaan. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}