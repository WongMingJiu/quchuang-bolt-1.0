import type { Generation } from '../../types';

interface AssetDetailDrawerProps {
  open: boolean;
  asset: Generation | null;
  onClose: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN');
}

function getAssetCategoryLabel(category: string | undefined) {
  switch (category) {
    case 'creative':
      return '创作资产';
    case 'reference':
      return '参考素材';
    case 'ip_teacher':
      return 'IP老师';
    default:
      return '未知类型';
  }
}

function getIpAssetTypeLabel(type: string | null | undefined) {
  if (type === 'persona') return '形象';
  if (type === 'scene') return '场景';
  return '-';
}

function getMediaLabel(type: string | undefined) {
  switch (type) {
    case 'image':
      return '图片';
    case 'video':
      return '视频';
    case 'audio':
      return '音频';
    default:
      return '-';
  }
}

export default function AssetDetailDrawer({ open, asset, onClose }: AssetDetailDrawerProps) {
  if (!open || !asset) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-[rgba(15,23,42,0.28)]">
      <div className="w-[min(92vw,720px)] h-full bg-white shadow-2xl border-l border-[#E6EDF5] overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#E6EDF5] sticky top-0 bg-white z-10 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">资产详情</h2>
            <p className="text-sm text-[#475569] mt-1">{asset.prompt || '未命名资产'}</p>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
            关闭
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">资产大类</p>
              <p className="text-sm font-semibold text-[#0F172A] mt-2">{getAssetCategoryLabel(asset.asset_category)}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">媒介类型</p>
              <p className="text-sm font-semibold text-[#0F172A] mt-2">{getMediaLabel(asset.asset_media_type)}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">IP老师子类</p>
              <p className="text-sm font-semibold text-[#0F172A] mt-2">{getIpAssetTypeLabel(asset.ip_asset_type)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">所属品类</p>
              <p className="text-sm font-semibold text-[#0F172A] mt-2">{asset.category}</p>
            </div>
            <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
              <p className="text-xs text-[#7B8CA8]">分镜类型</p>
              <p className="text-sm font-semibold text-[#0F172A] mt-2">{asset.storyboard_type}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
            <p className="text-xs text-[#7B8CA8]">创建时间</p>
            <p className="text-sm font-semibold text-[#0F172A] mt-2">{formatDateTime(asset.created_at)}</p>
          </div>

          <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
            <p className="text-xs text-[#7B8CA8]">资产摘要</p>
            <p className="text-sm text-[#0F172A] mt-2 leading-relaxed">{asset.prompt || '暂无描述'}</p>
          </div>

          {asset.asset_category === 'creative' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                <p className="text-xs text-[#7B8CA8]">可用性标注</p>
                <p className="text-sm font-semibold text-[#0F172A] mt-2">{asset.usability_status}</p>
              </div>
              <div className="rounded-2xl border border-[#E6EDF5] bg-[#F8FAFC] p-4">
                <p className="text-xs text-[#7B8CA8]">标注时间</p>
                <p className="text-sm font-semibold text-[#0F172A] mt-2">{formatDateTime(asset.usability_marked_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
