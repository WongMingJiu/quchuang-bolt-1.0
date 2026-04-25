import { useState } from 'react';
import QuotaEditDrawer from './QuotaEditDrawer';

const mockQuotaItems = [
  {
    id: 'q-1',
    subjectName: '张三',
    subjectType: 'user' as const,
    enabledModels: ['Seedance 2.0'],
    monthlyQuota: '1,000,000',
    usedQuota: '420,000',
    remainingQuota: '580,000',
    status: 'enabled',
    note: '面向重点项目提升额度',
  },
  {
    id: 'q-2',
    subjectName: '内容运营',
    subjectType: 'role' as const,
    enabledModels: ['Seedance 2.0'],
    monthlyQuota: '8,000,000',
    usedQuota: '2,340,000',
    remainingQuota: '5,660,000',
    status: 'enabled',
    note: '内容团队统一额度池',
  },
];

export default function QuotaManagementTab() {
  const [selectedItem, setSelectedItem] = useState<(typeof mockQuotaItems)[number] | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white border border-[#E6EDF5] p-4 shadow-sm flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="搜索用户 / 角色"
            className="min-w-[220px] rounded-xl border border-[#E6EDF5] px-3 py-2 text-sm outline-none focus:border-[#1F8BFF]"
          />
          <select className="rounded-xl border border-[#E6EDF5] px-3 py-2 text-sm outline-none focus:border-[#1F8BFF]">
            <option>全部类型</option>
            <option>用户</option>
            <option>角色</option>
          </select>
          <select className="rounded-xl border border-[#E6EDF5] px-3 py-2 text-sm outline-none focus:border-[#1F8BFF]">
            <option>全部状态</option>
            <option>启用</option>
            <option>停用</option>
          </select>
        </div>

        <div className="rounded-2xl bg-white border border-[#E6EDF5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E6EDF5] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">模型权限与额度</h2>
              <p className="text-xs text-[#7B8CA8] mt-1">查看并调整用户 / 角色的模型可用范围与月度额度。</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">用户 / 角色</th>
                  <th className="text-left px-5 py-3 font-medium">类型</th>
                  <th className="text-left px-5 py-3 font-medium">可用模型</th>
                  <th className="text-left px-5 py-3 font-medium">月总额度</th>
                  <th className="text-left px-5 py-3 font-medium">月已用</th>
                  <th className="text-left px-5 py-3 font-medium">月剩余</th>
                  <th className="text-left px-5 py-3 font-medium">状态</th>
                  <th className="text-left px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockQuotaItems.map(item => (
                  <tr key={item.id} className="border-t border-[#EEF3F8] hover:bg-[#FAFBFC]">
                    <td className="px-5 py-3 text-[#0F172A] font-medium">{item.subjectName}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.subjectType === 'user' ? '用户' : '角色'}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.enabledModels.join('、')}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.monthlyQuota}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.usedQuota}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.remainingQuota}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.status === 'enabled' ? '启用' : '停用'}</td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setSelectedItem(item)} className="text-[#1F8BFF] hover:text-[#1677FF] font-medium">编辑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QuotaEditDrawer open={Boolean(selectedItem)} item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
