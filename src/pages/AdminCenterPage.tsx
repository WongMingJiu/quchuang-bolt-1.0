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

interface RepairFailure {
  id: string;
  provider_task_id: string;
  reason: string;
}

interface RepairResult {
  scanned: number;
  matched: number;
  repaired: number;
  failed: number;
  failures: RepairFailure[];
}

async function parseRepairResponse(response: Response) {
  const raw = await response.text();
  if (!raw.trim()) {
    throw new Error(`修复旧视频预览接口返回空响应（HTTP ${response.status}）。请确认本地开发环境已接通 /api 路由。`);
  }

  try {
    return JSON.parse(raw) as RepairResult | { error?: string };
  } catch {
    throw new Error(`修复旧视频预览接口返回了无法解析的响应（HTTP ${response.status}）。`);
  }
}

export default function AdminCenterPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'personal' | 'quota'>('team');
  const [range, setRange] = useState<typeof RANGE_OPTIONS[number]['key']>('7d');
  const [repairing, setRepairing] = useState(false);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);

  const handleRepairVideoPreviews = async () => {
    if (repairing) return;
    setRepairing(true);
    setRepairError(null);

    try {
      const response = await fetch('/api/admin/repair-video-previews', {
        method: 'POST',
      });
      const result = await parseRepairResponse(response);

      if (!response.ok) {
        throw new Error(('error' in result && result.error) ? result.error : '修复旧视频预览失败。');
      }

      setRepairResult(result as RepairResult);
    } catch (error) {
      setRepairError(error instanceof Error ? error.message : '修复旧视频预览失败。');
      setRepairResult(null);
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="px-6 py-4 border-b border-[#E6EDF5] bg-white flex-shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-bold text-[#0F172A]">管理中心</h1>
            <p className="text-xs text-[#7B8CA8] mt-0.5">查看团队与个人使用情况，并管理模型权限与额度</p>
          </div>
          <button
            type="button"
            onClick={handleRepairVideoPreviews}
            disabled={repairing}
            className="px-4 py-2 rounded-xl bg-[#1F8BFF] text-white text-sm font-medium hover:bg-[#1677FF] transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {repairing ? '修复中...' : '修复旧视频预览'}
          </button>
        </div>
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

      {(repairError || repairResult) && (
        <div className="px-6 py-4 bg-[#F5F7FB] border-b border-[#E6EDF5]">
          {repairError && (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {repairError}
            </div>
          )}

          {repairResult && !repairError && (
            <div className="rounded-2xl border border-[#D8E2F0] bg-white px-4 py-4 shadow-sm space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">旧视频预览修复结果</h2>
                <p className="text-xs text-[#7B8CA8] mt-1">本次操作仅修复可重新拉取 provider 结果的旧视频记录。</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] px-4 py-3">
                  <p className="text-xs text-[#7B8CA8]">扫描记录</p>
                  <p className="mt-2 text-lg font-semibold text-[#0F172A]">{repairResult.scanned}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] px-4 py-3">
                  <p className="text-xs text-[#7B8CA8]">命中待修复</p>
                  <p className="mt-2 text-lg font-semibold text-[#0F172A]">{repairResult.matched}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] px-4 py-3">
                  <p className="text-xs text-[#7B8CA8]">修复成功</p>
                  <p className="mt-2 text-lg font-semibold text-[#166534]">{repairResult.repaired}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] px-4 py-3">
                  <p className="text-xs text-[#7B8CA8]">修复失败</p>
                  <p className="mt-2 text-lg font-semibold text-[#B91C1C]">{repairResult.failed}</p>
                </div>
              </div>
              {repairResult.failures.length > 0 && (
                <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                  <p className="text-xs font-medium text-[#92400E]">失败明细（最多显示 10 条）</p>
                  <div className="mt-2 space-y-2 text-xs text-[#78350F]">
                    {repairResult.failures.map((failure) => (
                      <div key={`${failure.id}-${failure.provider_task_id}`} className="rounded-lg bg-white/70 px-3 py-2 border border-[#FDE68A]">
                        <p>记录 ID：{failure.id}</p>
                        <p>任务 ID：{failure.provider_task_id}</p>
                        <p>原因：{failure.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'team' && <TeamDashboardTab range={range} />}
        {activeTab === 'personal' && <PersonalDashboardTab range={range} />}
        {activeTab === 'quota' && <QuotaManagementTab />}
      </div>
    </div>
  );
}
