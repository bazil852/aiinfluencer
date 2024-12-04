import React from 'react';
import { Edit, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Influencer } from '../types';

interface InfluencerCardProps {
  influencer: Influencer;
  onEdit: (influencer: Influencer) => void;
}

export const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{influencer.name}</h3>
      </div>
      <div className="text-sm text-gray-500 mb-4">
        <p>Template ID: {influencer.templateId}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(influencer)}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </button>
        <Link
          to={`/content/${influencer.id}`}
          data-tour="content-button"
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-600 hover:bg-blue-700"
        >
          <Video className="h-4 w-4 mr-2" />
          Content
        </Link>
      </div>
    </div>
  );
};