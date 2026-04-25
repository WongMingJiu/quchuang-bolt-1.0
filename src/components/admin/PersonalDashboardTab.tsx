import { useState } from 'react';

interface PersonalDashboardTabProps {
  range: 'today' | '24h' | '7d' | '30d' | '60d';
}

const summaryCards = [
  { label: '我的调用次数', value: '420' },
  { label: '我的 Token 用量', value: '602,310' },
  { label: '我的预估费用', value: '¥182.43' },
  { label: '我的月剩余 Token', value: '300,000' },
];

const mockUsageItems = [
  {
    id: 'g-1',
    time: '今天 10:32',
    model: 'Seedance 2.0',
    mode: '文生视频',
    tokens: '12,340',
    cost: '¥4.23',
    annotation: '可用',
    prompt: '一个未来城市的夜晚，霓虹灯倒映在雨后的街道上，镜头缓慢推进，电影感，细节丰富。',
    assets: '无参考物料',
    params: '16:9 / 10s / 有声 / 无水印 / 太极 / 口播类',
  },
  {
    id: 'g-2',
    time: '今天 09:14',
    model: 'Seedance 2.0',
    mode: '图生视频',
    tokens: '18,920',
    cost: '¥6.18',
    annotation: '待标注',
    prompt: '让画面中的人物自然向前走动，风吹动头发和衣角，整体保持电影感。',
    assets: '1 个参考物料',
    params: '9:16 / 8s / 有声 / 无水印 / 唱歌 / 情景类',
  },
  {
    id: 'g-3',
    time: '昨天 18:20',
    model: 'Seedance 2.0',
    mode: '全能参考',
    tokens: '9,870',
    cost: '¥3.48',
    annotation: '可优化',
    prompt: '参考给定图像构图、视频节奏和音频氛围，生成统一风格的动态视频。',
    assets: '3 个参考物料',
    params: '21:9 / 12s / 静音 / 无水印 / 瑜伽 / IP代练',
  },
];

export default function PersonalDashboardTab({ range }: PersonalDashboardTabProps) {
  const [selectedUsage, setSelectedUsage] = useState<(typeof mockUsageItems)[number] | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <h2 className="text-sm font-semibold text-[#0F172A]">个人调用明细</h2>
              <p className="text-xs text-[#7B8CA8] mt-1">查看个人在当前时间范围内的调用情况与结果质量状态。</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">时间</th>
                  <th className="text-left px-5 py-3 font-medium">模型</th>
                  <th className="text-left px-5 py-3 font-medium">调用模式</th>
                  <th className="text-left px-5 py-3 font-medium">Token 用量</th>
                  <th className="text-left px-5 py-3 font-medium">预估费用</th>
                  <th className="text-left px-5 py-3 font-medium">标注状态</th>
                  <th className="text-left px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockUsageItems.map(item => (
                  <tr key={item.id} className="border-t border-[#EEF3F8] hover:bg-[#FAFBFC]">
                    <td className="px-5 py-3 text-[#475569]">{item.time}</td>
                    <td className="px-5 py-3 text-[#0F172A] font-medium">{item.model}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.mode}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.tokens}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.cost}</td>
                    <td className="px-5 py-3 text-[#475569]">{item.annotation}</td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setSelectedUsage(item)} className="text-[#1F8BFF] hover:text-[#1677FF] font-medium">查看详情</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUsage && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-[rgba(15,23,42,0.28)]">
          <div className="w-[min(92vw,680px)] h-full bg-white shadow-2xl border-l border-[#E6EDF5] overflow-y-auto">
            <div className="px-6 py-5 border-b border-[#E6EDF5] sticky top-0 bg-white z-10 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">调用详情</h2>
                <p className="text-sm text-[#475569] mt-1">{selectedUsage.time} · {selectedUsage.mode}</p>
              </div>
              <button type="button" onClick={() => setSelectedUsage(null)} className="px-3 py-1.5 rounded-lg border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
                关闭
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                <p className="text-xs text-[#7B8CA8]">Prompt</p>
                <p className="text-sm text-[#0F172A] mt-2 leading-relaxed">{selectedUsage.prompt}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#7B8CA8]">参考物料</p>
                  <p className="text-sm text-[#0F172A] mt-2">{selectedUsage.assets}</p>
                </div>
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#7B8CA8]">调用参数</p>
                  <p className="text-sm text-[#0F172A] mt-2">{selectedUsage.params}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#7B8CA8]">Token 用量</p>
                  <p className="text-lg font-semibold text-[#0F172A] mt-2">{selectedUsage.tokens}</p>
                </div>
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#7B8CA8]">预估费用</p>
                  <p className="text-lg font-semibold text-[#0F172A] mt-2">{selectedUsage.cost}</p>
                </div>
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                  <p className="text-xs text-[#7B8CA8]">标注结果</p>
                  <p className="text-lg font-semibold text-[#0F172A] mt-2">{selectedUsage.annotation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
