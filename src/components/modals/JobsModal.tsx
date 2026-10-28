import React, { useState } from 'react';
import {
  X,
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Wrench,
  Store,
  User,
  ChevronRight,
  Send,
  Zap,
  Users,
  Check,
} from 'lucide-react';
import { JobItem, JobApplication } from '../../types';
import { sendAndroidAppNotification } from '../../services/androidNotificationService';

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobItem[];
  onAddNewJob: (newJob: JobItem) => void;
  onApplyJob: (jobId: string, application: JobApplication) => void;
  userProfile?: {
    uid?: string;
    name?: string;
    phone?: string;
    isUsta?: boolean;
    isEsnaf?: boolean;
  } | null;
}

export const JobsModal: React.FC<JobsModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onAddNewJob,
  onApplyJob,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'usta' | 'esnaf' | 'urgent' | 'my-applications'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Job Creation Form States
  const [newTitle, setNewTitle] = useState('');
  const [newPosterType, setNewPosterType] = useState<'usta' | 'esnaf'>('usta');
  const [newCompany, setNewCompany] = useState(userProfile?.name ? `${userProfile.name} (Atölye/Dükkan)` : '');
  const [newSector, setNewSector] = useState('İnşaat & Tesisat');
  const [newType, setNewType] = useState('Tam Zamanlı');
  const [newSalary, setNewSalary] = useState('');
  const [newPhone, setNewPhone] = useState(userProfile?.phone || '');
  const [newLocation, setNewLocation] = useState('Cumhuriyet Mah. / Nilüfer');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  // Job Application Form States
  const [applicantName, setApplicantName] = useState(userProfile?.name || '');
  const [applicantRole, setApplicantRole] = useState<'mahalle_sakini' | 'usta'>(
    userProfile?.isUsta ? 'usta' : 'mahalle_sakini'
  );
  const [applicantPhone, setApplicantPhone] = useState(userProfile?.phone || '');
  const [applicantExperience, setApplicantExperience] = useState('');
  const [applicantNote, setApplicantNote] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.sector && job.sector.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'usta') return job.posterType === 'usta';
    if (activeTab === 'esnaf') return job.posterType === 'esnaf';
    if (activeTab === 'urgent') return !!job.isUrgent;
    if (activeTab === 'my-applications') {
      return job.applications?.some((app) => app.applicantUid === userProfile?.uid);
    }
    return true;
  });

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newPhone.trim()) {
      showToast('Lütfen ilan başlığı, işletme adı ve telefon numarasını doldurunuz.');
      return;
    }

    const createdJob: JobItem = {
      id: `job-${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      posterType: newPosterType,
      location: newLocation.trim() || 'Mutlular Mah.',
      type: newType,
      salary: newSalary.trim() || 'Dolgun Ücret + SGK',
      phone: newPhone.trim(),
      sector: newSector,
      badge2: newIsUrgent ? 'ACİL' : newType,
      isUrgent: newIsUrgent,
      description:
        newDescription.trim() ||
        `${newCompany} bünyesinde çalışacak sorumluluk sahibi çalışma arkadaşı arıyoruz.`,
      requirements: newRequirements
        ? newRequirements.split('\n').filter((r) => r.trim().length > 0)
        : ['İş disiplinine sahip', 'Mahalle sakini veya yakın çevrede ikamet eden'],
      date: 'Bugün',
    };

    onAddNewJob(createdJob);

    // Send Real Android Push Notification to town
    sendAndroidAppNotification({
      title: `💼 Yeni Eleman Aranıyor: ${createdJob.title}`,
      body: `${createdJob.company} (${createdJob.location}) - ${createdJob.salary || 'Başvurular Açık'}. İncelemek için dokunun.`,
      type: 'duyuru',
      actionTab: 'hizmet',
      badgeText: createdJob.isUrgent ? 'ACİL ELEMAN' : 'İŞ İLANI',
      timestamp: Date.now(),
    });

    setIsCreateFormOpen(false);
    // Reset Form
    setNewTitle('');
    setNewSalary('');
    setNewDescription('');
    setNewRequirements('');
    setNewIsUrgent(false);

    showToast(`✓ "${createdJob.title}" ilanı başarıyla yayınlandı!`);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!applicantName.trim() || !applicantPhone.trim()) {
      showToast('Lütfen ad soyad ve telefon numaranızı giriniz.');
      return;
    }

    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: selectedJob.id,
      applicantUid: userProfile?.uid,
      applicantName: applicantName.trim(),
      applicantRole,
      applicantPhone: applicantPhone.trim(),
      experience: applicantExperience.trim() || 'Deneyimli',
      note: applicantNote.trim(),
      appliedAt: 'Az önce',
      status: 'beklemede',
    };

    onApplyJob(selectedJob.id, newApplication);

    // Update locally in selectedJob for instant UI feedback
    setSelectedJob({
      ...selectedJob,
      applications: [newApplication, ...(selectedJob.applications || [])],
    });

    // Send Android confirmation notification
    sendAndroidAppNotification({
      title: `📄 İş Başvurunuz Alındı!`,
      body: `"${selectedJob.title}" pozisyonu için başvurunuz ${selectedJob.company} işverenine iletildi.`,
      type: 'teklif',
      actionTab: 'profil',
      badgeText: 'BAŞVURU YAPILDI',
      timestamp: Date.now(),
    });

    setIsApplyModalOpen(false);
    showToast(`✓ "${selectedJob.title}" pozisyonuna başvurunuz başarıyla iletildi!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-inner">
              <Briefcase className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-black tracking-tight text-white">
                  MUTLULAR İŞ DÜNYASI & ELEMAN İLANLARI
                </h2>
                <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CANLI İSTİHDAM
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-medium">
                Usta ve esnaf eleman talebi açabilir • Mahalle sakinleri ve ustalar başvurabilir
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Top Bar */}
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pozisyon, usta, dükkan veya sektör ara..."
              className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
            />
          </div>

          {/* "+ Eleman Talebi / İlan Aç" Button */}
          <button
            onClick={() => {
              setIsCreateFormOpen(true);
              setSelectedJob(null);
            }}
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Eleman İlanı Ver</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 py-2 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tüm İlanlar ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('usta')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeTab === 'usta'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>Usta İlanları ({jobs.filter((j) => j.posterType === 'usta').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('esnaf')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeTab === 'esnaf'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200/80 hover:bg-purple-100'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Esnaf & Mağaza ({jobs.filter((j) => j.posterType === 'esnaf').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('urgent')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeTab === 'urgent'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-200/80 hover:bg-red-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Acil Eleman ({jobs.filter((j) => j.isUrgent).length})</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center shadow-md animate-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-neutral-100/60">
          {/* CREATE FORM OVERLAY */}
          {isCreateFormOpen ? (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200 shadow-md animate-in fade-in space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-900">
                      Yeni Eleman İlanı / İş Talebi Aç
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Ustanız veya işletmeniz için hemen mahalleden çalışma arkadaşı bulun
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateFormOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  İptal
                </button>
              </div>

              <form onSubmit={handleCreateJobSubmit} className="space-y-3.5">
                {/* Poster Type Switch */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1.5">
                    İlan Veren Kimliği *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPosterType('usta')}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        newPosterType === 'usta'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Usta / Atölye İlanı</div>
                        <div className="text-[10px] text-neutral-500">Kalfa, çırak, usta yardımcısı</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewPosterType('esnaf')}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        newPosterType === 'esnaf'
                          ? 'bg-purple-500/10 border-purple-500 text-purple-900 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Esnaf / Dükkan İlanı</div>
                        <div className="text-[10px] text-neutral-500">Kasiyer, garson, kurye, personel</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      Aranan Pozisyon / Meslek *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Örn: Sıhhi Tesisat Kalfası, Paket Kurye..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      İşletme / Usta Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Örn: Demir Ticaret / Ahmet Usta"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>

                {/* Sektör & Çalışma Şekli */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      Sektör *
                    </label>
                    <select
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    >
                      <option value="İnşaat & Tesisat">İnşaat & Tesisat</option>
                      <option value="Gastronomi & Restoran">Gastronomi & Restoran</option>
                      <option value="Otomotiv & Tamir">Otomotiv & Tamir</option>
                      <option value="Perakende & Market">Perakende & Market</option>
                      <option value="Ulaşım & Kurye">Ulaşım & Kurye</option>
                      <option value="Kuaför & Güzellik">Kuaför & Güzellik</option>
                      <option value="Genel Hizmetler">Genel Hizmetler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      Çalışma Şekli *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    >
                      <option value="Tam Zamanlı">Tam Zamanlı</option>
                      <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                      <option value="Günlük / Yevmiyeli">Günlük / Yevmiyeli</option>
                      <option value="Çırak & Kalfa">Çırak & Kalfa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      Maaş / Ücret Teklifi
                    </label>
                    <input
                      type="text"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="Örn: 32.000 ₺ + SGK + Yemek"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>

                {/* Telefon & Lokasyon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      İletişim Telefonu (WhatsApp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                      Adres / Mahalle
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Örn: Cumhuriyet Mah. Nilüfer"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>

                {/* Açıklama & Şartlar */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    İş Tanımı
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Yapılacak iş hakkında özet bilgi..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    Aranan Nitelikler (Her satıra bir özellik yazınız)
                  </label>
                  <textarea
                    rows={2}
                    value={newRequirements}
                    onChange={(e) => setNewRequirements(e.target.value)}
                    placeholder="Örn:&#10;Tesisat temel bilgisi&#10;B sınıfı ehliyet&#10;Mahallede ikamet eden"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                  <input
                    type="checkbox"
                    id="urgentJobCheck"
                    checked={newIsUrgent}
                    onChange={(e) => setNewIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="urgentJobCheck"
                    className="text-xs font-black text-rose-900 cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-rose-600" />
                    <span>⚡ Acil Eleman Aranıyor olarak işaretle (En üstte kırmızı vurguyla çıkar)</span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateFormOpen(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>İlanı Yayına Al</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* JOB LISTING CARDS */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 text-center space-y-2">
              <Briefcase className="w-10 h-10 text-neutral-300 mx-auto" />
              <h4 className="text-sm font-black text-neutral-700">İlan Bulunamadı</h4>
              <p className="text-xs text-neutral-500">
                Arama kriterlerinize uygun aktif iş ilanı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredJobs.map((job) => {
                const hasApplied = job.applications?.some((app) => app.applicantUid === userProfile?.uid);

                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-2xl border transition-all p-3.5 shadow-xs hover:shadow-md ${
                      job.isUrgent
                        ? 'border-red-300 bg-gradient-to-r from-red-50/20 via-white to-white'
                        : 'border-neutral-200/90'
                    }`}
                  >
                    {/* Header Row: Poster Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.posterType === 'usta' ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            <span>USTA İLANI</span>
                          </span>
                        ) : job.posterType === 'esnaf' ? (
                          <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[9.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            <span>ESNAF İLANI</span>
                          </span>
                        ) : null}

                        {job.isUrgent && (
                          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse uppercase">
                            <Zap className="w-2.5 h-2.5" />
                            <span>ACİL</span>
                          </span>
                        )}

                        {job.sector && (
                          <span className="bg-neutral-100 text-neutral-600 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                            {job.sector}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-neutral-400 font-semibold">{job.date}</span>
                    </div>

                    {/* Job Title and Company */}
                    <h3 className="text-sm font-black text-neutral-900 leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-bold mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{job.company}</span>
                      <span className="text-neutral-300">•</span>
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>

                    {/* Description preview */}
                    {job.description && (
                      <p className="text-[11.5px] text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {/* Badges Row (Salary, Type, Applications) */}
                    <div className="flex items-center gap-2 flex-wrap mt-2.5 pt-2 border-t border-neutral-100">
                      {job.salary && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                          💰 {job.salary}
                        </span>
                      )}

                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{job.type}</span>
                      </span>

                      {(job.applicationCount || 0) > 0 && (
                        <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ml-auto">
                          <Users className="w-3 h-3" />
                          <span>{job.applicationCount} Başvuru</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Detail, Apply, Call */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-1">
                      <div className="flex items-center gap-1.5">
                        {job.phone && (
                          <a
                            href={`tel:${job.phone.replace(/\s+/g, '')}`}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 flex items-center gap-1 text-[11px] font-bold transition"
                            title="Telefonla Ara"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">Ara</span>
                          </a>
                        )}

                        {job.phone && (
                          <a
                            href={`https://wa.me/90${job.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                              `Merhaba ${job.company}, Mutlular uygulamasındaki "${job.title}" ilanınız için yazıyorum.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-95 text-emerald-800 flex items-center gap-1 text-[11px] font-bold transition"
                            title="WhatsApp Mesajı"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Detail Modal Trigger */}
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 active:scale-95 text-neutral-700 text-xs font-bold transition cursor-pointer"
                        >
                          Detaylar
                        </button>

                        {/* Apply Button */}
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setIsApplyModalOpen(true);
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1 ${
                            hasApplied
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {hasApplied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Başvuruldu</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Başvur</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* JOB DETAIL MODAL */}
        {selectedJob && !isApplyModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-neutral-200 max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      selectedJob.posterType === 'usta'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedJob.posterType === 'usta' ? 'USTA İLANI' : 'ESNAF İLANI'}
                  </span>
                  {selectedJob.isUrgent && (
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      ACİL
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer text-neutral-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black text-neutral-900 leading-snug">
                  {selectedJob.title}
                </h3>
                <div className="text-xs font-bold text-neutral-600 mt-1 flex items-center gap-2">
                  <span>{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold block">Ücret / Maaş</span>
                  <span className="font-black text-emerald-700">{selectedJob.salary || 'Belirtilmedi'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold block">Çalışma Şekli</span>
                  <span className="font-black text-neutral-800">{selectedJob.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold block">Sektör</span>
                  <span className="font-bold text-neutral-700">{selectedJob.sector || 'Hizmet'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold block">İlan Tarihi</span>
                  <span className="font-bold text-neutral-700">{selectedJob.date}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight mb-1">
                  İş Tanımı
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  {selectedJob.description || 'Detaylı açıklama belirtilmedi.'}
                </p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight mb-1.5">
                    Aranan Nitelikler
                  </h4>
                  <ul className="space-y-1">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gelen başvurular yalnızca ilan sahibine gösterilir */}
              {selectedJob.ownerUid === userProfile?.uid &&
                selectedJob.applications &&
                selectedJob.applications.length > 0 && (
                <div className="pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-600" />
                      <span>Gelen Başvurular ({selectedJob.applications.length})</span>
                    </h4>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedJob.applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-black text-neutral-900 flex items-center gap-1.5">
                            <span>{app.applicantName}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                app.applicantRole === 'usta'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {app.applicantRole === 'usta' ? 'Usta' : 'Mahalle Sakini'}
                            </span>
                          </div>
                          {app.experience && (
                            <div className="text-[11px] text-neutral-500 mt-0.5">{app.experience}</div>
                          )}
                        </div>
                        <a
                          href={`tel:${app.applicantPhone.replace(/\s+/g, '')}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Ara</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Kapat
                </button>

                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Başvuruda Bulun</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JOB APPLICATION MODAL FORM */}
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 z-70 bg-black/65 flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-900">İş Başvurusunda Bulun</h3>
                    <p className="text-[11px] text-neutral-500 truncate max-w-[220px]">
                      {selectedJob.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-3">
                {/* Role Selection */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    Başvuru Yapan Kimliği *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApplicantRole('mahalle_sakini')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                        applicantRole === 'mahalle_sakini'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      👤 Mahalle Sakini
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicantRole('usta')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                        applicantRole === 'usta'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      🔨 Usta / Kalfa
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Adınız ve Soyadınız"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    İletişim Telefon Numaranız *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    İş Tecrübeniz / Deneyiminiz
                  </label>
                  <input
                    type="text"
                    value={applicantExperience}
                    onChange={(e) => setApplicantExperience(e.target.value)}
                    placeholder="Örn: 3 yıl tesisat deneyimim var, ehliyetim var..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-tight mb-1">
                    İşverene Mesajınız / Notunuz
                  </label>
                  <textarea
                    rows={2}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Hemen başlayabilirim, mahallede ikamet ediyorum..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Başvuruyu Gönder</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
