import React from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';

function LegendItem({ color, label, value }: { color: string, label: string, value: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${color}`}></div>
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm text-gray-300">{value}</span>
        </div>
    );
}

export default function AccountSummary() {
  return (
    <>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Hours Saved', val: '425' },
          { label: 'Documents', val: '142' },
          { label: 'Chatbots', val: '0' },
        ].map((stat) => (
          <div key={stat.label}>
              <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base text-white">Document Overview</h4>
        <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          View All <Icon icon={ICONS.chevronRight} size={16} />
        </button>
      </div>

      <div className="w-full h-3 bg-[#0f0f0f] rounded-full overflow-hidden mb-4 flex">
        <div className="h-full bg-purple-600 w-[32%]"></div>
        <div className="h-full bg-teal-500 w-[49%]"></div>
        <div className="h-full bg-gray-600 w-[10%]"></div>
        <div className="h-full bg-gray-400 w-[9%]"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LegendItem color="bg-purple-600" label="Text" value="32" />
        <LegendItem color="bg-teal-500" label="Image" value="98" />
        <LegendItem color="bg-gray-600" label="Audio" value="3" />
        <LegendItem color="bg-gray-400" label="Other" value="9" />
      </div>
    </>
  );
}