import { useState } from 'react';
import TeamDashboardTab from '../components/admin/TeamDashboardTab';
import PersonalDashboardTab from '../components/admin/PersonalDashboardTab';
import QuotaManagementTab from '../components/admin/QuotaManagementTab';

const RANGE_OPTIONS = [
  { key: 'today', label: '当天' },
  { key: '24h', label: '24小时' },
  { key: '7d', label: '7天' },
  { key: '30d', label: '30天' },
  { key: '60d', label: '60天' },
] as const;

const TAB_OPTIONS = [
  { key: 'team', label: '团队仪表盘' },
  { key: 'personal', label: '个人仪表盘' },
  { key: 'quota', label: '模型权限与额度' },
] as const;

export default function AdminCenterPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'personal' | 'quota'>('team');
  const [range, setRange] = useState<typeof RANGE_OPTIONS[number]['key']>('7d');

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="px-6 py-4 border-b border-[#E6EDF5] bg-white flex-shrink-0">
        <h1 className="text-base font-bold text-[#0F172A]">管理中心</h1>
        <p className="text-xs text-[#7B8CA8] mt-0.5">查看团队与个人使用情况，并管理模型权限与额度</p>
      </div>

      <div className="px-6 py-4 bg-white border-b border-[#E6EDF5] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {RANGE_OPTIONS.map(option => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === option.key ? 'bg-[#EAF3FF] text-[#1F8BFF] border border-[#B6E7FF]' : 'bg-[#F8FAFC] text-[#475569] border border-[#E6EDF5] hover:border-[#CBD5E1]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {TAB_OPTIONS.map(option => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveTab(option.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === option.key ? 'bg-[#0F172A] text-white' : 'bg-white text-[#475569] border border-[#E6EDF5] hover:border-[#CBD5E1]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'team' && <TeamDashboardTab range={range} />}
        {activeTab === 'personal' && <PersonalDashboardTab range={range} />}
        {activeTab === 'quota' && <QuotaManagementTab />}
      </div>
    </div>
  );
}
