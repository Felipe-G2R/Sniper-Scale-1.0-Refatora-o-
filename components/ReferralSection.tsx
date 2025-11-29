import React from 'react';
import type { Referral } from '../types';
import { UserGroupIcon, UserIcon } from './icons';

interface ReferralSectionProps {
  referrals: Referral[];
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ referrals }) => {
  if (!referrals || referrals.length === 0) {
    return null; // Don't render the section if there are no referrals
  }

  return (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
      <h2 className="flex items-center text-xl font-bold text-white mb-4">
        <UserGroupIcon className="w-6 h-6 text-cyan-400" />
        <span className="ml-3">Indicações Coletadas</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {referrals.map((referral, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg flex items-start space-x-4">
            <div className="flex-shrink-0 bg-gray-700 rounded-full p-2">
                <UserIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">{referral.name}</h4>
              {referral.contact && (
                <p className="text-sm text-cyan-400">{referral.contact}</p>
              )}
              <p className="text-xs text-gray-400 italic mt-1">"{referral.context}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralSection;
