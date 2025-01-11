import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InfluencerCard } from '../components/InfluencerCard';
import CreateInfluencerModal from '../components/CreateInfluencerModal';
import { useInfluencerStore } from '../store/influencerStore';
import { Influencer } from '../types';
import RequestInfluencerModal from '../components/RequestInfluencerModal';
import MultiStepModal from '../components/MultiStepModal';


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
      {isRequestModalOpen && (
        <MultiStepModal onClose={handleCloseRequestModal}/>
        // <RequestInfluencerModal onClose={handleCloseRequestModal} />
      )}
    </div>
  );
}

export default DashboardPage;