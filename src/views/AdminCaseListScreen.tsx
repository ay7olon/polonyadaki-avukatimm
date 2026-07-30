import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  UserPlus, 
  FileText, 
  ArrowUpDown,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { LegalCase, UrgencyLevel, CaseStatus, ScreenId } from '../types';

interface AdminCaseListScreenProps {
  cases: LegalCase[];
  onSelectCase: (c: LegalCase) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AdminCaseListScreen: React.FC<AdminCaseListScreenProps> = ({
  cases,
  onSelectCase,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLawyer, setSelectedLawyer] = useState<string>('all');

  // Filtering Logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.caseType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = selectedUrgency === 'all' || c.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesLawyer = selectedLawyer === 'all' || c.assignedLawyer.includes(selectedLawyer);

    return matchesSearch && matchesUrgency && matchesStatus && matchesLawyer;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'in_review':
        return <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">İnceleniyor</span>;
      case 'pending_docs':
        return <span className="px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 font-bold text-xs animate-pulse">Ek Belge Bekleniyor</span>;
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs">Valiliğe Sunuldu</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">Sonuçlandı</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">Atandı</span>;
    }
  };

  const criticalCount = cases.filter(c => c.urgency === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
              Avukat & Paralegal Paneli
            </span>
            <span className="text-xs text-slate-500 font-medium">Polonya Bürosu Derdest Dosya Cetveli</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Admin Dosya Yönetim Tablosu</h1>
        </div>

        {/* Urgent Stats Alert */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-900 shadow-sm">
            <Flame className="w-4 h-4 text-red-600 animate-bounce" />
            <span><strong className="text-red-700 text-sm">{criticalCount}</strong> Adet Çok Acil Dosya Müdahale Bekliyor</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-red-600" />
          <span>Filtreleme & Arama Seçenekleri</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-medium">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Müşteri adı veya dosya no..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={e => setSelectedUrgency(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
          >
            <option value="all">Tüm Aciliyet Seviyeleri</option>
            <option value="critical">🔴 Çok Acil (48 Saat / Kırmızı Kod)</option>
            <option value="urgent">🟠 Acil (15 Gün)</option>
            <option value="normal">⚪ Normal Süreç</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
          >
            <option value="all">Tüm Dosya Durumları</option>
            <option value="pending_docs">Ek Belge Bekleniyor</option>
            <option value="in_review">İnceleniyor</option>
            <option value="submitted">Valiliğe Sunuldu</option>
            <option value="completed">Sonuçlandı</option>
          </select>

          {/* Lawyer Filter */}
          <select
            value={selectedLawyer}
            onChange={e => setSelectedLawyer(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
          >
            <option value="all">Tüm Avukatlar</option>
            <option value="Piotr">Av. Piotr Kowalski</option>
            <option value="Zeynep">Av. Zeynep Yılmaz</option>
            <option value="Marek">Av. Marek Nowak</option>
          </select>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedUrgency('all');
              setSelectedStatus('all');
              setSelectedLawyer('all');
            }}
            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 transition border border-slate-200"
          >
            Filtreleri Sıfırla
          </button>

        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Dosya Kodu / Müşteri</th>
                <th className="p-4">Süreç Türü & Şehir</th>
                <th className="p-4">Aciliyet Etiketi</th>
                <th className="p-4">Mevcut Durum</th>
                <th className="p-4">Son Güncelleme</th>
                <th className="p-4">Atanan Avukat</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(c => {
                const isCritical = c.urgency === 'critical';

                return (
                  <tr
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c);
                      onNavigate('admin_case_detail');
                    }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      isCritical
                        ? 'bg-red-50/50 hover:bg-red-50 border-l-4 border-red-600'
                        : ''
                    }`}
                  >
                    
                    {/* Client & Case Code */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-red-600 text-xs">{c.caseNumber}</div>
                        <div className="font-extrabold text-sm text-slate-900">{c.clientName}</div>
                        <div className="text-[10px] text-slate-500">{c.clientEmail}</div>
                      </div>
                    </td>

                    {/* Case Type & City */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{c.caseType}</div>
                        <div className="text-[11px] text-slate-500">{c.city}</div>
                      </div>
                    </td>

                    {/* Urgency Badge */}
                    <td className="p-4">
                      {isCritical ? (
                        <span className="px-2.5 py-1 rounded bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse flex items-center space-x-1 w-fit shadow-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>Çok Acil (48h)</span>
                        </span>
                      ) : c.urgency === 'urgent' ? (
                        <span className="px-2.5 py-1 rounded bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider w-fit shadow-xs">
                          Acil (15 Gün)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold w-fit">
                          Normal
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Last Update */}
                    <td className="p-4 text-slate-500 font-mono text-[11px] font-medium">
                      {c.updatedAt}
                    </td>

                    {/* Assigned Lawyer */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={c.lawyerAvatar}
                          alt={c.assignedLawyer}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-800">{c.assignedLawyer}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                          onNavigate('admin_case_detail');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center space-x-1 ml-auto shadow-xs"
                      >
                        <span>Detay / Yönet</span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
