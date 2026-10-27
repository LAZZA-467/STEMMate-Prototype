import React, { useState, useMemo } from 'react';
import {
  Search,
  QrCode,
  Minus,
  Plus,
  Send,
  RotateCcw,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KitItem } from '../types';
import { STAFF_CODE } from '../data/mockData';
import { TouchButton } from '../components/TouchButton';
import { TouchCard } from '../components/TouchCard';

export const KitScreen: React.FC = () => {
  const {
    inventory,
    kitRequests,
    role,
    updateStock,
    checkOutKitItem,
    returnKitItem,
    requestKit,
    approveKitRequest,
    returnKitRequest,
    cancelKitRequest,
    showToast,
    can,
    roleMetadata,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'available' | 'in-use' | 'scheduled' | 'requests'>('all');
  const [scannerOpen, setScannerOpen] = useState(false);

  const isCustodian = can('manage_kit_custody');
  const canRequest = can('create_session_plan');
  const isReadOnly = !isCustodian;
  const myStaffCode = STAFF_CODE[role] || 'EC-02';

  const counts = {
    all: inventory.length,
    available: inventory.filter(i => i.status === 'available').length,
    'in-use': inventory.filter(i => i.status === 'in-use').length,
    scheduled: inventory.filter(i => i.status === 'scheduled' || i.status === 'low-stock').length,
    requests: kitRequests.filter(r => r.status !== 'returned').length,
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return inventory.filter(item => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.boxNumber.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesSeg =
        activeSegment === 'all' ||
        (activeSegment === 'available' && item.status === 'available') ||
        (activeSegment === 'in-use' && item.status === 'in-use') ||
        (activeSegment === 'scheduled' && (item.status === 'scheduled' || item.status === 'low-stock'));

      return matchesSearch && matchesSeg;
    });
  }, [inventory, searchQuery, activeSegment]);

  const renderBadge = (item: KitItem) => {
    if (item.status === 'available') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{item.availableUnits} available</span>
        </span>
      );
    }
    if (item.status === 'in-use') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          <span>In use</span>
        </span>
      );
    }
    if (item.status === 'low-stock') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Restock needed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Scheduled</span>
      </span>
    );
  };

  return (
    <div id="screen-kit" className="flex-1 flex flex-col bg-[#F8FAF9] relative pb-28 overflow-y-auto">
      {/* Top Header & Search */}
      <section className="px-4 pt-3 pb-2 bg-white border-b border-gray-200 shrink-0 space-y-2.5 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
              Kit Custody &amp; Stock
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              {role} View · {isReadOnly ? 'Read-Only Mode' : isCustodian ? 'Stock Control Active' : 'Central Stores'}
            </p>
          </div>
          <span className="text-[11px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200 px-2.5 py-0.5 rounded-full">
            {counts.all} Kits
          </span>
        </div>

        {/* Search & QR Trigger */}
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            id="kit-search-input"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search box number, kit or location..."
            className="w-full h-11 pl-10 pr-12 text-[13.5px] bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] touch-manipulation"
          />
          <TouchButton
            onPress={() => setScannerOpen(true)}
            aria-label="Scan QR Code"
            pressScale="scale-90"
            debounceMs={300}
            className="absolute right-1 w-10 h-10 flex items-center justify-center rounded-lg text-[#0F766E] hover:bg-teal-50 cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
          </TouchButton>
        </div>

        {/* Segmented Filter Control */}
        <nav aria-label="Kit filters" className="w-full overflow-x-auto no-scrollbar pt-0.5 pb-1">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 whitespace-nowrap text-xs">
            {(['all', 'available', 'in-use', 'scheduled', 'requests'] as const).map(seg => {
              const isActive = activeSegment === seg;
              const labels: Record<string, string> = {
                all: 'All',
                available: 'Available',
                'in-use': 'In Use',
                scheduled: 'Scheduled',
                requests: 'Requests',
              };
              return (
                <TouchButton
                  key={seg}
                  onPress={() => setActiveSegment(seg)}
                  aria-pressed={isActive}
                  pressScale="scale-95"
                  debounceMs={200}
                  className={`px-3 py-1.5 min-h-[34px] rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{labels[seg]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white text-[#0F766E]' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {counts[seg]}
                  </span>
                </TouchButton>
              );
            })}
          </div>
        </nav>
      </section>

      {/* Main List Content */}
      <div className="px-4 py-3 space-y-3 flex-1">
        {/* Kit Requests Segment */}
        {activeSegment === 'requests' ? (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-600 px-0.5">
              {isCustodian
                ? 'Approve requests and verify returns. Overdue kits flagged at top.'
                : 'Your kit requests are tracked below.'}
            </p>

            {kitRequests.map(req => {
              const isMine = req.facilitator === myStaffCode;
              return (
                <article
                  key={req.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                      <span className="text-gray-500 font-mono">{req.boxNumber}</span> {req.kitName}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        req.status === 'overdue'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : req.status === 'checked-out'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : req.status === 'returned'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
                    <dt className="text-gray-500">Needed On:</dt>
                    <dd className="font-semibold text-gray-800">{req.dateNeeded}</dd>
                    <dt className="text-gray-500">Return Due:</dt>
                    <dd className="font-semibold text-gray-800">{req.returnDue}</dd>
                    <dt className="text-gray-500">Facilitator:</dt>
                    <dd className="text-gray-800 font-mono">
                      Staff {req.facilitator} {isMine && '(You)'}
                    </dd>
                    <dt className="text-gray-500">Session:</dt>
                    <dd className="text-gray-800 truncate">{req.planTitle}</dd>
                  </dl>

                  {/* Custodian Approval / Return Buttons with Instant Touch Feedback */}
                  {isCustodian && req.status === 'requested' && (
                    <TouchButton
                      onPress={() => approveKitRequest(req.id)}
                      loadingText="Approving..."
                      debounceMs={500}
                      className="w-full min-h-[44px] bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve &amp; Check Out</span>
                    </TouchButton>
                  )}

                  {isCustodian && (req.status === 'checked-out' || req.status === 'overdue') && (
                    <TouchButton
                      onPress={() => returnKitRequest(req.id)}
                      loadingText="Logging Return..."
                      debounceMs={500}
                      className="w-full min-h-[44px] bg-white border-2 border-gray-300 hover:border-[#0F766E] text-gray-800 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#0F766E]" />
                      <span>Log Return to Stores</span>
                    </TouchButton>
                  )}

                  {!isCustodian && !isReadOnly && isMine && req.status === 'requested' && (
                    <TouchButton
                      onPress={() => cancelKitRequest(req.id)}
                      className="w-full min-h-[40px] bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-medium text-[12px] cursor-pointer"
                    >
                      Cancel Request
                    </TouchButton>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          /* Inventory Items Cards */
          filteredItems.map(item => {
            const myRequest = kitRequests.find(
              r => r.kitId === item.id && r.facilitator === myStaffCode && r.status !== 'returned'
            );

            return (
              <TouchCard
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-[#0F766E] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold font-mono text-[12px]">
                      {item.boxNumber}
                    </span>
                    <span className="text-[12px] text-gray-500">{item.location}</span>
                  </div>
                  {renderBadge(item)}
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Next scheduled: {item.nextScheduled}</span>
                  </div>
                </div>

                {/* Custodian Unit Stock Control with Instant Fast Buttons */}
                {isCustodian && (
                  <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">
                        Custodian Stock Count
                      </span>
                      <span className="text-[12px] text-gray-700">
                        Units: <strong className="text-gray-900">{item.availableUnits}</strong> of{' '}
                        {item.totalUnits}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TouchButton
                        aria-label="Decrease stock"
                        onPress={() => updateStock(item.id, -1)}
                        disabled={item.availableUnits <= 0}
                        pressScale="scale-90"
                        debounceMs={120}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </TouchButton>
                      <span className="text-[13px] font-bold text-gray-900 min-w-[20px] text-center tabular-nums">
                        {item.availableUnits}
                      </span>
                      <TouchButton
                        aria-label="Increase stock"
                        onPress={() => updateStock(item.id, 1)}
                        disabled={item.availableUnits >= item.totalUnits}
                        pressScale="scale-90"
                        debounceMs={120}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </TouchButton>
                    </div>
                  </div>
                )}

                {/* Kit Contents */}
                {item.contents && item.contents.length > 0 && (
                  <div className="bg-[#F8FAF9] rounded-xl p-2.5 border border-gray-200/60">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Kit Contents
                    </p>
                    <div className="flex flex-wrap gap-1 text-[11px] text-gray-700">
                      {item.contents.map((c, i) => (
                        <span
                          key={i}
                          className="bg-white px-2 py-0.5 rounded-md border border-gray-200 font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher Request Action */}
                {!isReadOnly && !isCustodian && (
                  <div>
                    {myRequest ? (
                      <p className="min-h-[44px] rounded-xl border border-teal-300 bg-teal-50 text-[12px] font-semibold text-[#0F766E] flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>You requested this kit ({myRequest.status})</span>
                      </p>
                    ) : (
                      <TouchButton
                        onPress={() => requestKit(item.id)}
                        loadingText="Sending Request..."
                        debounceMs={500}
                        className="w-full min-h-[44px] bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Request Kit for Field Session</span>
                      </TouchButton>
                    )}
                  </div>
                )}

                {/* Custodian Checkout / Return Button */}
                {isCustodian && (
                  <div>
                    {item.status === 'in-use' ? (
                      <TouchButton
                        onPress={() => returnKitItem(item.id)}
                        loadingText="Logging Return..."
                        debounceMs={500}
                        className="w-full min-h-[44px] bg-white border-2 border-gray-300 hover:border-[#0F766E] text-gray-800 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-[#0F766E]" />
                        <span>Log Return to Cupboard</span>
                      </TouchButton>
                    ) : (
                      <TouchButton
                        onPress={() => checkOutKitItem(item.id)}
                        loadingText="Checking Out..."
                        debounceMs={500}
                        className="w-full min-h-[44px] bg-[#0F766E] hover:bg-[#0c625b] text-white rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Send className="w-4 h-4" />
                        <span>Check Out to Room 5</span>
                      </TouchButton>
                    )}
                  </div>
                )}
              </TouchCard>
            );
          })
        )}

        {/* Storage Bay Audit Quick Check */}
        {!isReadOnly && (
          <section className="bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E] shrink-0">
                <Warehouse className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  Bay 3 Shelf B Storage
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Last verified: Yesterday 16:15
                </p>
              </div>
            </div>

            <TouchButton
              onPress={() => setScannerOpen(true)}
              className="shrink-0 text-[12px] text-[#0F766E] font-bold hover:underline cursor-pointer"
            >
              Verify Tag
            </TouchButton>
          </section>
        )}

        <div className="pt-2 pb-4 text-center">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>Equipment tracking is anonymous · Pupil assignments never logged.</span>
          </p>
        </div>
      </div>

      {/* QR Scanner Modal Simulator */}
      {scannerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-[320px] rounded-2xl p-5 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">Kit Scanner Ready</h3>
              <p className="text-[12px] text-gray-600 mt-1">
                Point camera at equipment box QR code or barcode tag to log inventory movement.
              </p>
            </div>

            <div className="p-3 bg-gray-100 rounded-xl border border-dashed border-gray-300 font-mono text-[12px] text-gray-700">
              Camera sensor active: Box #04 detected
            </div>

            <TouchButton
              onPress={() => {
                setScannerOpen(false);
                showToast('Box #04 scanned and logged successfully');
              }}
              loadingText="Logging Tag..."
              debounceMs={400}
              className="w-full min-h-[46px] bg-[#0F766E] text-white font-semibold text-[14px] rounded-xl hover:bg-[#0c625b] cursor-pointer"
            >
              Confirm Scan
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  );
};
