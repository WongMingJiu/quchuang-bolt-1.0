interface MemberUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    role: string;
    calls: number;
    tokens: number;
    cost: number | string;
    monthlyRemainingCalls?: number | string;
    monthlyRemainingTokens?: number | string;
    lastUsedAt: string | null;
  } | null;
}

const mockUsageDetails = [
  {
    id: 'u-1-1',
    createdAt: '今天 10:32',
    prompt: '一个未来城市的夜晚，霓虹灯倒映在雨后的街道上...',
    referenceAssets: '2 个参考物料',
    mode: '图生视频',
    paramsSummary: '16:9 / 10s / 有声 / 无水印 / 太极 / 口播类',
    tokens: '12,340',
    cost: '¥4.23',
    annotationStatus: '可用',
  },
  {
    id: 'u-1-2',
    createdAt: '今天 09:14',
    prompt: '清晨山谷云海延时摄影，金色阳光穿透薄雾...',
    referenceAssets: '1 个参考物料',
    mode: '文生视频',
    paramsSummary: '21:9 / 8s / 静音 / 无水印 / 瑜伽 / 情景类',
    tokens: '9,870',
    cost: '¥3.48',
    annotationStatus: '待标注',
  },
];

export default function MemberUsageDrawer({ open, onClose, member }: MemberUsageDrawerProps) {
  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-[rgba(15,23,42,0.28)]">
      <div className="w-[min(92vw,780px)] h-full bg-white shadow-2xl border-l border-[#E6EDF5] overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#E6EDF5] sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">成员使用详情</h2>
              <p className="text-sm text-[#475569] mt-1">{member.name} · {member.role}</p>
            </div>
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
              关闭
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">调用次数</p>
              <p className="text-xl font-bold text-[#0F172A] mt-2">{member.calls}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">Token 用量</p>
              <p className="text-xl font-bold text-[#0F172A] mt-2">{member.tokens.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">预估费用</p>
              <p className="text-xl font-bold text-[#0F172A] mt-2">{member.cost}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">最后调用时间</p>
              <p className="text-sm font-medium text-[#0F172A] mt-2">{member.lastUsedAt ?? '-'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E6EDF5] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6EDF5]">
              <h3 className="text-sm font-semibold text-[#0F172A]">调用明细</h3>
              <p className="text-xs text-[#7B8CA8] mt-1">用于查看该成员的提示词、参数、参考物料和标注结果。</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFC] text-[#64748B]">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">时间</th>
                    <th className="text-left px-5 py-3 font-medium">Prompt 摘要</th>
                    <th className="text-left px-5 py-3 font-medium">参考物料</th>
                    <th className="text-left px-5 py-3 font-medium">调用模式</th>
                    <th className="text-left px-5 py-3 font-medium">调用参数</th>
                    <th className="text-left px-5 py-3 font-medium">Token 用量</th>
                    <th className="text-left px-5 py-3 font-medium">预估费用</th>
                    <th className="text-left px-5 py-3 font-medium">标注结果</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsageDetails.map(item => (
                    <tr key={item.id} className="border-t border-[#EEF3F8] hover:bg-[#FAFBFC] align-top">
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.createdAt}</td>
                      <td className="px-5 py-3 text-[#0F172A] min-w-[220px]">{item.prompt}</td>
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.referenceAssets}</td>
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.mode}</td>
                      <td className="px-5 py-3 text-[#475569] min-w-[240px]">{item.paramsSummary}</td>
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.tokens}</td>
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.cost}</td>
                      <td className="px-5 py-3 text-[#475569] whitespace-nowrap">{item.annotationStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
