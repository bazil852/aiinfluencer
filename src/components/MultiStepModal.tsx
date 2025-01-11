import React, { useState, useEffect } from "react";
import { X, Smartphone, Monitor } from "lucide-react";

/** Props for the entire multi-step modal */
interface MultiStepModalProps {
  onClose: () => void;
}

interface AvatarFormData {
  age: string;
  gender: "Male" | "Female";
  description: string;
  background: string;
  viewType: "Full Body" | "Waist Up" | "Head Shot";
  viewFormat: "9:16" | "16:9";
}

const AGE_OPTIONS = [
  "18-25", "26-35", "36-45", "46-55", "56-65", "65+"
];

const VIEW_TYPES = ["Full Body", "Waist Up", "Head Shot"] as const;

export default function MultiStepModal({ onClose }: MultiStepModalProps) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<"optionA" | "optionB" | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [requestId, setRequestId] = useState("");

  const [formData, setFormData] = useState<AvatarFormData>({
    age: AGE_OPTIONS[0],
    gender: "Male",
    description: "",
    background: "",
    viewType: "Full Body",
    viewFormat: "9:16"
  });

  const generatePrompt = (data: AvatarFormData) => {
    return `Generate a photo of ${data.age} ${data.gender} ${data.description}
The photo should be of the avatar looking straight at the camera.
The background behind the avatar should be ${data.background}.
And the photo should be ${data.viewType.toLowerCase()}, making sure that the head or the body isn't cropped off.`;
  };

  const handleNext = () => {
    if (!selectedOption) {
      alert("Please select one of the cards (Option A or Option B).");
      return;
    }
    setStep(2);
  };

  const handleSubmitOptionB = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
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

  const handleSubmitOptionA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.bfl.ml/v1/flux-pro-1.1-ultra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Key": import.meta.env.VITE_FLEX!,
        },
        body: JSON.stringify({
          prompt: generatePrompt(formData),
          seed: 42,
          aspect_ratio: formData.viewFormat,
          safety_tolerance: 2,
          output_format: "jpeg",
          raw: false,
          image_prompt_strength: 0.1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRequestId(data.id);
      } else {
        setError(data.message || "Failed to generate avatar.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating the avatar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://api.bfl.ml/v1/get_result?id=${requestId}`,
          {
            headers: {
              "X-Key": import.meta.env.VITE_FLEX!,
            },
          }
        );
        const data = await response.json();

        if (data.status === "Ready") {
          setImageURL(data.result.sample);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  const handleGoBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${step === 2 && selectedOption === "optionA" ? "max-w-5xl" : "max-w-md"} w-full p-6 relative`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request New Influencer</h2>
            <p className="text-gray-600 mb-6">Select one of the options below.</p>
            <div className="space-y-4">
              <label
                htmlFor="optionA"
                className={`block border rounded-md p-4 cursor-pointer ${
                  selectedOption === "optionA" ? "border-blue-500" : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="optionA"
                    name="option"
                    checked={selectedOption === "optionA"}
                    onChange={() => setSelectedOption("optionA")}
                  />
                  <span className="ml-3 text-gray-900 font-medium">Option A: Generate Avatar</span>
                </div>
                <p className="ml-8 mt-2 text-sm text-gray-500">
                  Use AI-generated Avatar and Request New Influencer
                </p>
              </label>

              <div className="flex items-center justify-center my-4">
                <div className="border-t border-gray-300 flex-grow mr-2"></div>
                <span className="text-gray-500">or</span>
                <div className="border-t border-gray-300 flex-grow ml-2"></div>
              </div>

              <label
                htmlFor="optionB"
                className={`block border rounded-md p-4 cursor-pointer ${
                  selectedOption === "optionB" ? "border-blue-500" : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="optionB"
                    name="option"
                    checked={selectedOption === "optionB"}
                    onChange={() => setSelectedOption("optionB")}
                  />
                  <span className="ml-3 text-gray-900 font-medium">Option B: Schedule a Call</span>
                </div>
                <p className="ml-8 mt-2 text-sm text-gray-500">
                  Schedule a Call with Support to Set Up the Influencer
                </p>
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedOption === "optionA" ? "Generate Avatar" : "Schedule a Call for Influencer Setup"}
            </h2>

            {selectedOption === "optionA" ? (
              <div className="flex gap-8">
                <div className="flex-1 min-w-[320px]">
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <form onSubmit={handleSubmitOptionA} className="h-[500px] flex flex-col">
                    <div className="flex-grow space-y-4 overflow-y-auto pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                            Avatar Age
                          </label>
                          <select
                            id="age"
                            value={formData.age}
                            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {AGE_OPTIONS.map(age => (
                              <option key={age} value={age}>{age}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            Avatar Gender
                          </label>
                          <select
                            id="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as "Male" | "Female" }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Avatar Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g., professional looking with a warm smile, wearing a business casual outfit in neutral colors"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[80px] resize-none"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="background" className="block text-sm font-medium text-gray-700">
                          Background Description
                        </label>
                        <textarea
                          id="background"
                          value={formData.background}
                          onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                          placeholder="e.g., modern office with blurred background, natural lighting from large windows"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[80px] resize-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="viewType" className="block text-sm font-medium text-gray-700">
                            View Type
                          </label>
                          <select
                            id="viewType"
                            value={formData.viewType}
                            onChange={(e) => setFormData(prev => ({ ...prev, viewType: e.target.value as typeof VIEW_TYPES[number] }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {VIEW_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            View Format
                          </label>
                          <div className="mt-1 flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer border ${
                              formData.viewFormat === "9:16" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}>
                              <input
                                type="radio"
                                name="viewFormat"
                                value="9:16"
                                checked={formData.viewFormat === "9:16"}
                                onChange={(e) => setFormData(prev => ({ ...prev, viewFormat: e.target.value as "9:16" | "16:9" }))}
                                className="sr-only"
                              />
                              <Smartphone className="h-5 w-5" />
                              <span className="text-sm">Vertical</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer border ${
                              formData.viewFormat === "16:9" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}>
                              <input
                                type="radio"
                                name="viewFormat"
                                value="16:9"
                                checked={formData.viewFormat === "16:9"}
                                onChange={(e) => setFormData(prev => ({ ...prev, viewFormat: e.target.value as "9:16" | "16:9" }))}
                                className="sr-only"
                              />
                              <Monitor className="h-5 w-5" />
                              <span className="text-sm">Horizontal</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleGoBack}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Generating..." : "Generate Avatar"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex-1 border-l pl-8 min-w-[320px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Avatar</h3>
                  <div className="h-[500px] overflow-y-auto">
                    {imageURL ? (
                      <img src={imageURL} alt="Generated Avatar" className="w-full rounded-md" />
                    ) : (
                      <div className="bg-gray-100 rounded-md p-4 text-center text-gray-500 h-full flex items-center justify-center">
                        {isSubmitting ? "Generating avatar..." : "No avatar generated yet"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOptionB} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Call Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Schedule Call
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