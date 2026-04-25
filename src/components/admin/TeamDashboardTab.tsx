import { useState } from 'react';
import MemberUsageDrawer from './MemberUsageDrawer';

interface TeamDashboardTabProps {
  range: 'today' | '24h' | '7d' | '30d' | '60d';
}

const summaryCards = [
  { label: '调用次数', value: '12,430' },
  { label: 'Token 用量', value: '3.82M' },
  { label: '预估费用', value: '¥2,341' },
  { label: '月剩余 Token', value: '6.20M' },
  { label: '活跃成员', value: '18' },
];

const mockMembers = [
  { id: 'u-1', name: '张三', role: '运营', calls: 320, tokens: 812340, cost: '¥240.12', monthlyRemainingCalls: 120, monthlyRemainingTokens: '120,000', lastUsedAt: '今天 10:32' },
  { id: 'u-2', name: '李四', role: '内容', calls: 280, tokens: 612330, cost: '¥183.44', monthlyRemainingCalls: 360, monthlyRemainingTokens: '360,000', lastUsedAt: '今天 09:14' },
  { id: 'u-3', name: '王五', role: '教练', calls: 190, tokens: 422100, cost: '¥122.81', monthlyRemainingCalls: 580, monthlyRemainingTokens: '580,000', lastUsedAt: '昨天 18:20' },
];

export default function TeamDashboardTab({ range }: TeamDashboardTabProps) {
  const [selectedMember, setSelectedMember] = useState<(typeof mockMembers)[number] | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(card => (
            <div key={card.label} className="rounded-2xl bg-white border border-[#E6EDF5] p-4 shadow-sm">
              <p className="text-xs text-[#7B8CA8]">{card.label}</p>
              <p className="text-2xl font-bold text-[#0F172A] mt-2">{card.value}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">统计范围：{range}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white border border-[#E6EDF5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E6EDF5] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">团队成员使用情况</h2>
              <p className="text-xs text-[#7B8CA8] mt-1">支持查看成员明细，并为后续权限与额度调整提供入口。</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">成员名称</th>
                  <th className="text-left px-5 py-3 font-medium">角色</th>
                  <th className="text-left px-5 py-3 font-medium">调用次数</th>
                  <th className="text-left px-5 py-3 font-medium">Token 用量</th>
                  <th className="text-left px-5 py-3 font-medium">预估费用</th>
                  <th className="text-left px-5 py-3 font-medium">月剩余次数</th>
                  <th className="text-left px-5 py-3 font-medium">月剩余 Token</th>
                  <th className="text-left px-5 py-3 font-medium">最后调用时间</th>
                  <th className="text-left px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockMembers.map(member => (
                  <tr key={member.id} className="border-t border-[#EEF3F8] hover:bg-[#FAFBFC]">
                    <td className="px-5 py-3 text-[#0F172A] font-medium">{member.name}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.role}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.calls}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.tokens.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.cost}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.monthlyRemainingCalls}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.monthlyRemainingTokens}</td>
                    <td className="px-5 py-3 text-[#475569]">{member.lastUsedAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setSelectedMember(member)} className="text-[#1F8BFF] hover:text-[#1677FF] font-medium">查看详情</button>
                        <button type="button" className="text-[#475569] hover:text-[#0F172A] font-medium">调整权限额度</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MemberUsageDrawer open={Boolean(selectedMember)} member={selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  );
}
