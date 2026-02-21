import React, { useState } from 'react';
import { Users, Trophy, LayoutGrid, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, AppTab } from './types';
import { ParticipantInput } from './components/ParticipantInput';
import { LuckyDraw } from './components/LuckyDraw';
import { Grouping } from './components/Grouping';
import { cn } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('input');
  const [participants, setParticipants] = useState<Participant[]>([]);

  const tabs = [
    { id: 'input', label: '名單管理', icon: Users },
    { id: 'draw', label: '獎品抽籤', icon: Trophy },
    { id: 'grouping', label: '自動分組', icon: LayoutGrid },
  ] as const;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                HR Smart Assistant
              </h1>
            </div>
            
            <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'input' && (
              <ParticipantInput 
                participants={participants} 
                onParticipantsChange={setParticipants} 
              />
            )}
            
            {activeTab === 'draw' && (
              <div className="space-y-6">
                {participants.length === 0 ? (
                  <EmptyState 
                    title="尚未有名單" 
                    description="請先在「名單管理」中加入成員，才能開始抽籤。"
                    onAction={() => setActiveTab('input')}
                  />
                ) : (
                  <LuckyDraw participants={participants} />
                )}
              </div>
            )}
            
            {activeTab === 'grouping' && (
              <div className="space-y-6">
                {participants.length === 0 ? (
                  <EmptyState 
                    title="尚未有名單" 
                    description="請先在「名單管理」中加入成員，才能開始分組。"
                    onAction={() => setActiveTab('input')}
                  />
                ) : (
                  <Grouping participants={participants} />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Hint */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 px-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          HR Smart Assistant • 提升職場效率的智慧工具
        </p>
      </footer>
    </div>
  );
}

function EmptyState({ title, description, onAction }: { title: string; description: string; onAction: () => void }) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-24 flex flex-col items-center justify-center text-center px-6">
      <div className="bg-slate-50 p-4 rounded-full mb-6">
        <Users size={48} className="text-slate-300" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md mb-8">{description}</p>
      <button
        onClick={onAction}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100"
      >
        前往名單管理
      </button>
    </div>
  );
}
