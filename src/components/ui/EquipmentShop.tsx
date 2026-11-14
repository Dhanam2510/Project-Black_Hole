import React, { useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  Package,
  RotateCcw,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { SpacecraftComponent } from '../../types/game';
import { COMPONENT_CATALOG, CATEGORY_LABELS } from '../../data/components';
import { sound } from '../../utils/audio';

interface EquipmentShopProps {
  initialBudget: number;
  currentBudget: number;
  spentBudget: number;
  inventory: SpacecraftComponent[];
  onBuyComponent: (comp: SpacecraftComponent) => void;
  onSellComponent: (comp: SpacecraftComponent) => void;
  onBack: () => void;
}

export const EquipmentShop: React.FC<EquipmentShopProps> = ({
  initialBudget,
  currentBudget,
  spentBudget,
  inventory,
  onBuyComponent,
  onSellComponent,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];

  const filteredItems = COMPONENT_CATALOG.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getInventoryCount = (id: string) => {
    return inventory.filter((item) => item.id === id).length;
  };

  const handleBuy = (comp: SpacecraftComponent) => {
    if (currentBudget >= comp.cost) {
      sound.playConfirm();
      onBuyComponent(comp);
    } else {
      sound.playError();
    }
  };

  const handleSell = (comp: SpacecraftComponent) => {
    sound.playClick(750, 0.05);
    onSellComponent(comp);
  };

  const remainingBalance = currentBudget;
  const estimatedOpsCost = 35000; // estimated station-keeping / DSN communications

  return (
    <div className="w-screen h-screen bg-space-950 font-display flex flex-col select-none overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="h-16 border-b border-cyan-500/20 bg-space-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO WORKSHOP</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">
            AEROSPACE HARDWARE MARKETPLACE
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">AUTHORIZED DEFENSE & SCIENCE SUPPLY</p>
        </div>

        <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>RESALE RETURN RATE: 85%</span>
        </div>
      </div>

      {/* Financial Ledger Banner */}
      <div className="bg-space-900 border-b border-slate-800 px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">INITIAL GRANT BUDGET</div>
          <div className="text-white font-bold text-sm">${initialBudget.toLocaleString()}</div>
        </div>

        <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">TOTAL PROCUREMENT SPENT</div>
          <div className="text-amber-400 font-bold text-sm">${spentBudget.toLocaleString()}</div>
        </div>

        <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">REMAINING BALANCE</div>
          <div
            className={`font-bold text-sm ${
              remainingBalance >= 0 ? 'text-emerald-400' : 'text-red-400 animate-pulse'
            }`}
          >
            ${remainingBalance.toLocaleString()}
          </div>
        </div>

        <div className="bg-space-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">EST. OPERATIONAL RESERVE</div>
          <div className="text-cyan-300 font-bold text-sm">${estimatedOpsCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Catalog & Inventory Split */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        {/* Left: Marketplace Catalog (8 cols) */}
        <div className="col-span-12 md:col-span-8 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none">
            {categories.map((cat) => {
              const isActive = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    sound.playClick(900, 0.02);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-glow'
                      : 'bg-space-850 text-slate-400 hover:text-white hover:bg-space-800'
                  }`}
                >
                  {cat === 'all' ? 'ALL EQUIPMENT' : CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((comp) => {
              const canAfford = currentBudget >= comp.cost;
              const inStock = getInventoryCount(comp.id);

              return (
                <div
                  key={comp.id}
                  className="rounded-xl border border-slate-800 bg-space-900/80 p-4 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          {CATEGORY_LABELS[comp.category]}
                        </span>
                        <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-mono font-bold text-sm">
                          ${comp.cost.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{comp.mass} kg</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-2">
                      {comp.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>POWER: {comp.power > 0 ? `+${comp.power}W` : `${comp.power}W`}</span>
                      <span>•</span>
                      <span>SCIENCE: +{comp.scienceValue} pts</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-400">
                      IN INVENTORY: <span className="text-white font-bold">{inStock}</span>
                    </div>

                    <button
                      onClick={() => handleBuy(comp)}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition ${
                        canAfford
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Agency Purchased Inventory & Resale (4 cols) */}
        <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800 bg-space-900/90 flex flex-col overflow-hidden p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                AGENCY INVENTORY
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {inventory.length} ITEMS HELD
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {inventory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
                <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
                <span>NO EQUIPMENT IN INVENTORY YET</span>
                <span className="text-[10px] mt-1 text-slate-600">
                  Purchase items from the catalog on the left
                </span>
              </div>
            ) : (
              inventory.map((item, idx) => {
                const resaleValue = Math.floor(item.cost * 0.85);
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-2.5 rounded-lg border border-slate-800 bg-space-950/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="text-white font-bold truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-slate-400">RESALE: ${resaleValue.toLocaleString()}</div>
                    </div>

                    <button
                      onClick={() => handleSell(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition text-[11px]"
                      title="Sell item back for 85% credit"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>SELL</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 mt-2">
            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="w-full py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider font-mono hover:bg-cyan-400 transition"
            >
              FINALIZE PURCHASES & RETURN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
