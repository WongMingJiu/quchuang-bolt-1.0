interface QuotaEditDrawerProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    subjectName: string;
    subjectType: 'user' | 'role';
    enabledModels: string[];
    monthlyQuota: string;
    usedQuota: string;
    remainingQuota: string;
    status: string;
    note?: string;
  } | null;
}

export default function QuotaEditDrawer({ open, onClose, item }: QuotaEditDrawerProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-[rgba(15,23,42,0.28)]">
      <div className="w-[min(92vw,560px)] h-full bg-white shadow-2xl border-l border-[#E6EDF5] overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#E6EDF5] sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">调整权限与额度</h2>
              <p className="text-sm text-[#475569] mt-1">{item.subjectName} · {item.subjectType === 'user' ? '用户' : '角色'}</p>
            </div>
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
              关闭
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">可用模型</label>
            <div className="rounded-xl border border-[#E6EDF5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0F172A]">
              {item.enabledModels.join('、')}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">月总额度</label>
              <input defaultValue={item.monthlyQuota} className="w-full rounded-xl border border-[#E6EDF5] px-3 py-2 text-sm outline-none focus:border-[#1F8BFF]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">状态</label>
              <select defaultValue={item.status} className="w-full rounded-xl border border-[#E6EDF5] px-3 py-2 text-sm outline-none focus:border-[#1F8BFF]">
                <option value="enabled">启用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">月已用</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-2">{item.usedQuota}</p>
            </div>
            <div className="rounded-xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">月剩余</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-2">{item.remainingQuota}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">备注</label>
            <textarea defaultValue={item.note ?? ''} rows={4} className="w-full rounded-xl border border-[#E6EDF5] px-3 py-3 text-sm outline-none focus:border-[#1F8BFF]" placeholder="补充说明权限或额度调整原因" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E6EDF5] px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
            取消
          </button>
          <button type="button" className="px-4 py-2 rounded-xl bg-[#1F8BFF] text-white text-sm font-medium hover:bg-[#1677FF] transition-all">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
