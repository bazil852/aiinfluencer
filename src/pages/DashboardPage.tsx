import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InfluencerCard } from '../components/InfluencerCard';
import CreateInfluencerModal from '../components/CreateInfluencerModal';
import { useInfluencerStore } from '../store/influencerStore';
import { Influencer } from '../types';

// NEW MODAL COMPONENT
function RequestInfluencerModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Request new Influencer</h2>
        <p className="text-gray-600 mb-6">
          Something about requesting a new influencer or scheduling a call.
          You can customize this description as needed.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false); // NEW state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const { influencers, fetchInfluencers } = useInfluencerStore();

  useEffect(() => {
    fetchInfluencers().catch(console.error);
  }, [fetchInfluencers]);

  const handleEditInfluencer = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInfluencer(null);
  };

  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Influencers</h1>
        <div className="flex gap-2">
        <button
            onClick={handleOpenRequestModal}
            data-tour="headset"
            className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
            title="Schedule Call"
          >
            <Headset size={20} />
          </button>
          <button
            onClick={() => navigate('/planner')}
            data-tour="calendar"
            className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
            title="Content Planner"
          >
            <Calendar size={20} />
          </button>
          <button
            data-tour="create-influencer"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-[#c9fffc] text-black p-2 rounded-lg hover:bg-[#a0fcf9] transition-colors"
            title="Create Influencer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {influencers.map((influencer) => (
          <InfluencerCard
            key={influencer.id}
            influencer={influencer}
            onEdit={handleEditInfluencer}
          />
        ))}
      </div>

      {isModalOpen && (
        <CreateInfluencerModal
          influencer={editingInfluencer}
          onClose={handleCloseModal}
        />
      )}
      {/* REQUEST NEW INFLUENCER MODAL (HEADSET BUTTON) */}
      {isRequestModalOpen && (
        <RequestInfluencerModal onClose={handleCloseRequestModal} />
      )}
    </div>
  );
}

export default DashboardPage;