import React, { useState } from 'react';
import { X, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { useContentStore } from '../store/contentStore';

interface CreateVideoModalProps {
  influencerId: string;
  templateId: string;
  onClose: () => void;
}

type ScriptAction = 'write' | 'shorten' | 'longer' | 'engaging';

export default function CreateVideoModal({ influencerId, templateId, onClose }: CreateVideoModalProps) {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showScriptActions, setShowScriptActions] = useState(false);
  const { generateScript, generateVideo } = useContentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !script) return;

    setIsGenerating(true);
    setError('');

    try {
      await generateVideo({
        influencerId,
        templateId,
        title,
        script
      });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create video';
      setError(errorMessage);
      setIsGenerating(false);
    }
  };

  const getPromptForAction = (action: ScriptAction, currentScript: string): string => {
    switch (action) {
      case 'write':
        return currentScript;
      case 'shorten':
        return `Make this script more concise while maintaining its key message: ${currentScript}`;
      case 'longer':
        return `Expand this script with more details and examples while maintaining its tone: ${currentScript}`;
      case 'engaging':
        return `Make this script more engaging and captivating while maintaining its core message: ${currentScript}`;
      default:
        return currentScript;
    }
  };

  const handleGenerateScript = async (action: ScriptAction) => {
    if (!script) {
      setError('Please enter a prompt or script first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowScriptActions(false);

    try {
      const prompt = getPromptForAction(action, script);
      const generatedScript = await generateScript(prompt);
      setScript(generatedScript);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate script';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Video
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Video Title
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
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="script" className="block text-sm font-medium text-gray-700">
                Script
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowScriptActions(!showScriptActions)}
                  disabled={isGenerating}
                  className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center disabled:opacity-50"
                >
                  Generate with AI
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {showScriptActions && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleGenerateScript('write')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Write Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateScript('shorten')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Shorten Script
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateScript('longer')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Make Longer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateScript('engaging')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        More Engaging
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <textarea
              id="script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="Enter your script or prompt here..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !title || !script}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Video'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}