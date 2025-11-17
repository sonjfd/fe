import React from 'react';
import type { Slider } from '@/api/admin.slider.api';
import { StatusSwitch } from './StatusSwitch';

export const SliderTable: React.FC<{
  rows: Slider[];
  loading: boolean; error: string|null;
  page: number; total: number; size: number; totalPages: number;
  onPrev: ()=>void; onNext: ()=>void; onGoto: (page:number)=>void;
  onEdit: (id:number)=>void; onDelete: (id:number)=>void;
  onToggleActive: (s:Slider)=>void; onChangePosition: (s:Slider,pos:number)=>void;
}> = ({ rows, loading, error, page, total, totalPages, onPrev, onNext, onGoto, onEdit, onDelete, onToggleActive, onChangePosition }) => (
  <>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Redirect</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tạo</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Đang tải…</td></tr>}
          {error && !loading && <tr><td colSpan={7} className="px-6 py-8 text-center text-red-600">{error}</td></tr>}
          {!loading && !error && rows.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>}
          {rows.map((s)=> (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-6 py-3"><img src={s.imageUrl} className="h-14 w-24 object-cover rounded-md border"/></td>
              <td className="px-6 py-3">
                <div className="font-medium">{s.title}</div>
                {s.description && <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{s.description}</div>}
              </td>
              <td className="px-6 py-3 text-sm text-blue-600 truncate max-w-[16rem]">{s.redirectUrl || '-'}</td>
              <td className="px-6 py-3">
                <input type="number" defaultValue={s.position} className="w-20 rounded-lg border-gray-300" onBlur={(e)=>{ const next = Number(e.currentTarget.value || 0); if (next !== s.position) onChangePosition(s, next); }}/>
              </td>
              <td className="px-6 py-3"><StatusSwitch checked={s.active} onChange={()=>onToggleActive(s)} /></td>
              <td className="px-6 py-3 text-sm">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <button onClick={()=>onEdit(s.id)} className="hover:text-gray-900" title="Sửa">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L17.25 4.875"/></svg>
                  </button>
                  <button onClick={()=>onDelete(s.id)} className="hover:text-red-600" title="Xoá">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10z"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex items-center justify-between p-4 text-sm">
      <span className="text-gray-500">Hiển thị {rows.length} / {total}</span>
      <div className="flex items-center gap-2">
        <button disabled={page<=0} onClick={onPrev} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50">‹</button>
        {Array.from({length: Math.min(5, Math.max(1,totalPages))}).map((_,i)=>{
          const n = i; return (
            <button key={n} onClick={()=>onGoto(n)} className={`h-9 w-9 rounded-lg border ${page===n? 'border-indigo-200 bg-indigo-50 text-indigo-600':'border-gray-200'}`}>{n+1}</button>
          );
        })}
        <button disabled={page>=totalPages-1} onClick={onNext} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-50">›</button>
      </div>
    </div>
  </>
);
