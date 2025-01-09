import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  BookOpen,
  HelpCircle,
  Webhook,
  Menu,
  X,
  MonitorDot
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import GuidedTour from "./GuidedTour";
import HeyGenSetupModal from "./HeyGenSetupModal";
import WebhookModal from "./WebhookModal";
import { supabase } from "../lib/supabase";

export default function Layout() {
  const navigate = useNavigate();
  const { currentUser: user, clearCurrentUser } = useAuthStore();
  const [showGuide, setShowGuide] = useState(false);
  const [showHeyGenSetup, setShowHeyGenSetup] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPlan, setUserPlan] = useState("");

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleAdminPanel = () => {
    navigate("/admin-panel");
  };

  useEffect(() => {
    const fetchUserPlan = async () => {
      const session = await supabase.auth.getSession();

      if (session?.data?.session?.user?.email) {
        console.log(session.data.session.user.email);
        const email = session.data.session.user.email.trim();

        const { data, error } = await supabase
          .from("users")
          .select("*") // Fetch all columns
          .eq("email", email) // Match the trimmed email
          .single(); // Fetch a single row or return null if none is found

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          console.log("Fetched user data:", data);
          setUserPlan(data.tier);
        }
      }
    };

    fetchUserPlan();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <img
                src="https://i.ibb.co/BgtVKG9/LIMITED-TIME-FREE-ACCESS-5.png"
                alt="AI Influencer Logo"
                className="h-10 w-auto mr-3"
              />
              <h1 className="text-lg font-bold text-blue-600 hidden sm:block">
                The AI Influencer{" "}
              </h1>
              {userPlan && (
                <div className="ml-3 px-2 py-1 bg-blue-600 text-blue-100 text-sm font-medium rounded-full shadow-sm">
                  {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
                </div>
              )}
            </button>

            {/* Hamburger Menu for Mobile */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Menu Items */}
            {user && (
              <div className="hidden sm:flex items-center space-x-4">
                <button
                  onClick={() => setShowWebhooks(true)}
                  data-tour="automations"
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <Webhook className="h-4 w-4 mr-2" />
                  Automations
                </button>
                <button
                  onClick={() => setShowHeyGenSetup(true)}
                  data-tour="heygen-setup"
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  HeyGen Setup
                </button>
                <button
                  onClick={() => setShowGuide(true)}
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guide
                </button>
                <button
                  data-tour="admin-panel"
                  onClick={handleAdminPanel}
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <MonitorDot className="h-4 w-4 mr-2" />
                  Admin Panel
                </button>
                <button
                  data-tour="settings"
                  onClick={handleSettings}
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && user && (
            <div className="sm:hidden mt-2">
              <button
                onClick={() => setShowWebhooks(true)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Webhook className="h-4 w-4 mr-2 inline" />
                Automations
              </button>
              <button
                onClick={() => setShowHeyGenSetup(true)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <HelpCircle className="h-4 w-4 mr-2 inline" />
                HeyGen Setup
              </button>
              <button
                onClick={() => setShowGuide(true)}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <BookOpen className="h-4 w-4 mr-2 inline" />
                Guide
              </button>
              <button
                onClick={handleSettings}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">
        <Outlet />
      </main>

      {showGuide && <GuidedTour onClose={() => setShowGuide(false)} />}
      {showHeyGenSetup && (
        <HeyGenSetupModal onClose={() => setShowHeyGenSetup(false)} />
      )}
      {showWebhooks && <WebhookModal onClose={() => setShowWebhooks(false)} />}
    </div>
  );
}
