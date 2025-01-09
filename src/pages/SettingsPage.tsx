import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Key } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, updateApiKeys } = useAuthStore();
  const [openaiKey, setOpenaiKey] = useState(currentUser?.openaiApiKey || "");
  const [heygenKey, setHeygenKey] = useState(currentUser?.heygenApiKey || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPlan, setCurrentPlan] = useState("Loading...");
  const [isFetching, setIsFetching] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      updateApiKeys(openaiKey, heygenKey);
      setSuccess("API keys saved successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Failed to save API keys");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const handleUpgradePlan = () => {
    navigate("/update-plan");
  };
  
  useEffect(() => {
    const fetchUserPlan = async () => {
      setIsFetching(true);
      try {
        const session = await supabase.auth.getSession();

        if (session?.data?.session?.user?.email) {
          const email = session.data.session.user.email.trim();
          const { data, error } = await supabase
            .from("users")
            .select("tier")
            .eq("email", email)
            .maybeSingle();

          if (error) {
            console.error("Error fetching user plan:", error);
          } else if (!data) {
            console.warn("No matching user found in the database");
            setCurrentPlan("Free"); // Default to 'Free' if no plan is found
          } else {
            setCurrentPlan(
              data.tier.charAt(0).toUpperCase() + data.tier.slice(1)
            ); // Capitalize plan name
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserPlan();
  }, []);

  const buttonText = currentPlan === "Pro" ? "Downgrade" : "Upgrade";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Subscription Overview Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Subscription Plan
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-xl font-semibold text-gray-600">
              {isFetching ? "Loading..." : currentPlan}
            </p>
          </div>
          <button
            onClick={handleUpgradePlan}
            className={`inline-flex items-center justify-center w-32 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              currentPlan === "Pro"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {isFetching ? "Loading..." : buttonText}
          </button>
        </div>
        {/* {(currentPlan === "Pro" || currentPlan === "Basic") && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Manage your billing details</p>
            <button className="inline-flex items-center justify-center w-32 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Click Here
            </button>
          </div>
        )} */}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">API Settings</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="openai-key"
              className="block text-sm font-medium text-gray-700"
            >
              OpenAI API Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                id="openai-key"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="sk-..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="heygen-key"
              className="block text-sm font-medium text-gray-700"
            >
              HeyGen API Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                id="heygen-key"
                value={heygenKey}
                onChange={(e) => setHeygenKey(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your HeyGen API key"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center w-32 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
