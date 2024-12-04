import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';
import { useInfluencerStore } from '../store/influencerStore';
import { Plus, Loader2, AlertCircle, Video, ArrowLeft, Upload, Webhook, Trash2 } from 'lucide-react';
import CreateVideoModal from '../components/CreateVideoModal';
import BulkCreateModal from '../components/BulkCreateModal';
import WebhookModal from '../components/WebhookModal';

export default function ContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const { influencers } = useInfluencerStore();
  const { contents, fetchContents, refreshContents, deleteContents } = useContentStore();
  const influencer = influencers.find(inf => inf.id === id);

  useEffect(() => {
    if (!influencer) {
      console.log("No influencer found, navigating to dashboard.");
      navigate('/dashboard');
      return;
    }
  
    console.log("Fetching contents for influencer:", id);
    fetchContents(id!)
      .then(() => console.log("Fetched contents successfully"))
      .catch(error => console.error("Error fetching contents:", error));
  
    const interval = setInterval(() => {
      console.log("Refreshing contents for influencer:", id);
      refreshContents(id!)
        .then(() => console.log("Refreshed contents successfully"))
        .catch(error => console.error("Error refreshing contents:", error));
    }, 5000);
  
    return () => {
      console.log("Clearing interval for refreshing contents");
      clearInterval(interval);
    };
  }, [influencer, id, fetchContents, refreshContents, navigate]);
  
  

  const handleDeleteSelected = async () => {
    if (selectedContents.length === 0) return;
    try {
      await deleteContents(id!, selectedContents);
      setSelectedContents([]);
    } catch (error) {
      console.error('Failed to delete contents:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedContents.length === influencerContents.length) {
      setSelectedContents([]);
    } else {
      setSelectedContents(influencerContents.map(content => content.id));
    }
  };

  if (!influencer) return null;

  const influencerContents = contents[id!] || [];
  const videosInQueue = influencerContents.filter(c => c.status === 'generating').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#c9fffc]">{influencer.name}'s Content</h1>
          <div className="flex items-center gap-2">
            {videosInQueue > 0 && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center">
                <Loader2 className="animate-spin mr-2" size={16} />
                {videosInQueue} video{videosInQueue > 1 ? 's' : ''} in queue
              </div>
            )}
            <button
              onClick={() => setShowWebhooks(true)}
              className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
              title="Automations"
            >
              <Webhook size={20} />
            </button>
            <button
              onClick={toggleSelectAll}
              className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
              title="Select All"
            >
              <input
                type="checkbox"
                checked={selectedContents.length === influencerContents.length}
                onChange={toggleSelectAll}
                className="h-4 w-4"
              />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedContents.length === 0}
              className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors disabled:opacity-50"
              title="Delete Selected"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setShowBulkCreate(true)}
              className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
              title="Bulk Create"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              data-tour="create-video"
              className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
              title="Create New Video"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {influencerContents.map((content) => (
            <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {content.title}
                  </h3>
                  <input
                    type="checkbox"
                    checked={selectedContents.includes(content.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContents([...selectedContents, content.id]);
                      } else {
                        setSelectedContents(selectedContents.filter(id => id !== content.id));
                      }
                    }}
                    className="h-4 w-4"
                  />
                </div>
                <div className="text-sm text-gray-500 mb-4 h-24 overflow-y-auto custom-scrollbar">
                  {content.script}
                </div>
                {content.status === 'generating' && (
                  <div className="flex items-center justify-center text-blue-600 py-2">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Generating video...
                  </div>
                )}
                {content.status === 'failed' && (
                  <div className="flex items-center justify-center text-red-600 py-2">
                    <AlertCircle className="mr-2" size={16} />
                    {content.error || 'Generation failed'}
                  </div>
                )}
                {content.status === 'completed' && content.video_url && (
                    <div className="flex flex-col items-center justify-center w-full">
                      <video
                        src={content.video_url}
                        controls
                        className="w-full rounded-lg mb-4"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <a
                        href={content.video_url}
                        download
                        className="px-4 py-2 bg-[#c9fffc] text-black rounded-lg hover:bg-[#a0fcf9] transition-colors"
                      >
                        Download Video
                      </a>
                    </div>
                  )}

              </div>
            </div>
          ))}
        </div>

        {showCreateForm && (
          <CreateVideoModal
            influencerId={influencer.id}
            templateId={influencer.templateId}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {showBulkCreate && (
          <BulkCreateModal
            influencerId={influencer.id}
            templateId={influencer.templateId}
            onClose={() => setShowBulkCreate(false)}
          />
        )}

        {showWebhooks && (
          <WebhookModal
            influencerId={id}
            onClose={() => setShowWebhooks(false)}
          />
        )}
      </div>
    </div>
  );
}