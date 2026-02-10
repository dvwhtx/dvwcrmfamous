import React from 'react';
import { BidStatus } from '@/data/crmData';

const statusColors: Record<BidStatus, { bg: string; text: string; dot: string }> = {
  Request: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Draft: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
  Submitted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Under Review': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  Deferred: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
  Lost: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Won: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

interface StatusBadgeProps {
  status: BidStatus;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const colors = statusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 ${colors.bg} ${colors.text} font-semibold rounded-full ${
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
