import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type PlanName = "Free" | "Basic" | "Pro";

interface Plan {
  name: PlanName;
  price: number;
  features: string[];
  duration: string;
  link?: string;
  priceId?: string;
}

export default function UpdatePlan() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [currentPlan, setCurrentPlan] = useState<PlanName | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const plans: Plan[] = [
    {
      name: "Free",
      price: 0,
      features: [
        "Access to basic features",
        "Limited API calls",
        "Community support",
      ],
      duration: "/month",
    },
    {
      name: "Basic",
      price: 30,
      features: [
        "All Free plan features",
        "Increased API calls",
        "Email support",
      ],
      duration: "/month",
      link: "https://buy.stripe.com/test_14kcPLfK62pr9pu3cc",
      priceId: "price_1QShokFK63VyJS7h2XWMMXkM",
    },
    {
      name: "Pro",
      price: 60,
      features: [
        "All Basic plan features",
        "Unlimited API calls",
        "Priority support",
        "Access to premium features",
      ],
      duration: "/month",
      link: "https://buy.stripe.com/test_dR6aHD55s2pr59efYZ",
      priceId: "price_1QbgQjFK63VyJS7h8TWavrrG",
    },
  ];

  useEffect(() => {
    const fetchUserPlan = async () => {
      setLoading(true);
      try {
        if (currentUser?.email) {
          const { data, error } = await supabase
            .from("users")
            .select("tier, subscription_id")
            .eq("email", currentUser.email)
            .single();

          if (error) {
            console.error("Error fetching user plan:", error);
          } else if (data) {
            setCurrentPlan(
              data.tier.charAt(0).toUpperCase() + data.tier.slice(1)
            ); // Capitalize first letter
            setSubscriptionId(data.subscription_id);
          } else {
            console.warn("User plan not found. Defaulting to Free.");
            setCurrentPlan("Free");
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user plan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [currentUser?.email]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleDowngradeToFree = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will lose access to premium features."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "http://localhost:5002/api/stripe/cancel-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: currentUser?.email, subId: subscriptionId }), // Pass the user's email
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      alert("Your subscription has been canceled.");
      setCurrentPlan("Free"); // Update the UI to reflect the free plan
      setSubscriptionId(null); // Clear the subscription ID
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Choose Your Plan
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-lg shadow-lg overflow-hidden ${
                isCurrentPlan
                  ? "border-4 border-blue-500 bg-blue-50"
                  : "border border-gray-200"
              }`}
            >
              <div className="px-6 py-8 bg-gray-50 sm:p-10 sm:pb-6 h-80">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl leading-6 font-semibold text-gray-900 flex items-center">
                      {plan.name}
                      {isCurrentPlan && (
                        <span className="ml-3 px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      )}
                    </h2>

                    <p className="mt-4 text-4xl font-extrabold text-gray-900">
                      ${plan.price}
                      {plan.duration}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg
                        className="h-6 w-6 text-green-500 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-6 bg-white sm:p-10 sm:pt-6">
                {!isCurrentPlan ? (
                  plan.name === "Free" ? (
                    <button
                      onClick={handleDowngradeToFree}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {`Choose ${plan.name}`}
                    </button>
                  ) : (
                    <a
                      href={
                        plan.link + "?prefilled_email=" + currentUser?.email
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {`Choose ${plan.name}`}
                    </a>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Settings
        </button>
      </div>
    </div>
  );
}
