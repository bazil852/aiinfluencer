import React, { useState } from "react";
import { X } from "lucide-react";

/** Props for the entire multi-step modal */
interface MultiStepModalProps {
  onClose: () => void;
}

/**
 * Two-step modal:
 * Step 1: User chooses one of two radio cards (Option A or Option B)
 * Step 2: Based on choice:
 *  - If A => Render "some placeholder" content or form
 *  - If B => Render your "request new influencer" form
 */
export default function MultiStepModal({ onClose }: MultiStepModalProps) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<
    "optionA" | "optionB" | ""
  >("");

  // For the Option B form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** -----------------------------
   * Step 1 Handlers
   * -----------------------------
   */
  const handleNext = () => {
    if (!selectedOption) {
      alert("Please select one of the cards (Option A or Option B).");
      return;
    }
    setStep(2);
  };

  /** -----------------------------
   * Step 2 Handlers
   * -----------------------------
   */
  // If Option B was chosen, we handle the "request influencer" logic
  const handleSubmitOptionB = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Example: open Calendly with title, description
      const calendlyBaseUrl = "https://calendly.com/bazilsb7";
      const encodedTitle = encodeURIComponent(title);
      const encodedDescription = encodeURIComponent(description);
      const calendlyUrl = `${calendlyBaseUrl}?customTitle=${encodedTitle}&customDescription=${encodedDescription}`;

      window.open(calendlyUrl, "_blank");
      onClose();
    } catch (err) {
      console.error("Error requesting influencer:", err);
      setError("Failed to schedule call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If Option A was chosen, you can do something else (placeholder)
  const handleSubmitOptionA = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Option A logic
    alert("Option A form submitted!");
    onClose();
  };

  // Navigation / Step Control
  const handleGoBack = () => {
    setStep(1);
  };

  // A helper to close the entire modal
  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close Button (top-right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: Select A or B */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request new Influencer
            </h2>
            <p className="text-gray-600 mb-6">
              Select one of the two options below.
            </p>

            {/* Radio Card Options */}
            <div className="space-y-4">
              {/* Option A */}
              <label
                htmlFor="optionA"
                className={`block border rounded-md p-4 cursor-pointer ${
                  selectedOption === "optionA"
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="optionA"
                    name="influencerOption"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    checked={selectedOption === "optionA"}
                    onChange={() => setSelectedOption("optionA")}
                  />
                  <span className="ml-3 text-gray-900 font-medium">
                    Option A
                  </span>
                </div>
                <p className="ml-8 mt-2 text-sm text-gray-500">
                  Use AI generated Avatar and Request new Influencer
                </p>
              </label>

              {/* Divider with "or" */}
              <div className="flex items-center justify-center my-4">
                <div className="border-t border-gray-300 flex-grow mr-2"></div>
                <span className="text-gray-500">or</span>
                <div className="border-t border-gray-300 flex-grow ml-2"></div>
              </div>

              {/* Option B */}
              <label
                htmlFor="optionB"
                className={`block border rounded-md p-4 cursor-pointer ${
                  selectedOption === "optionB"
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="optionB"
                    name="influencerOption"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    checked={selectedOption === "optionB"}
                    onChange={() => setSelectedOption("optionB")}
                  />
                  <span className="ml-3 text-gray-900 font-medium">
                    Option B
                  </span>
                </div>
                <p className="ml-8 mt-2 text-sm text-gray-500">
                  Schedule a Call with Support to set up the Influencer
                </p>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm 
                           font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm 
                           font-medium text-black bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Based on the selected option */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedOption === "optionA"
                ? "Request New Influencer with Avatar"
                : "Schedule Call for Influencer Setup"}
            </h2>

            {selectedOption === "optionB" && error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {selectedOption === "optionA" ? (
              /** -------------- Option A Content -------------- */
              <form onSubmit={handleSubmitOptionA} className="space-y-4">
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Prompt Description
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className=" mt-2 px-4 py-2 border border-transparent rounded-md
                               shdow-sm text-sm font-medium text-black bg-blue-600
                               hover:bg-blue-700"
                    >
                      Generate Avatar
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-4 py-2 border border-gray-300 rounded-md 
                               shadow-sm text-sm font-medium text-gray-700 bg-white
                               hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md
                               shadow-sm text-sm font-medium text-black bg-blue-600
                               hover:bg-blue-700"
                  >
                    Request
                  </button>
                </div>
              </form>
            ) : (
              /** -------------- Option B Content -------------- */
              <form onSubmit={handleSubmitOptionB} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                               text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md 
                               shadow-sm text-sm font-medium text-black bg-blue-600 
                               hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Call"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
