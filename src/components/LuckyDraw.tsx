import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Settings2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Participant } from '../types';
import { cn } from '../utils';

interface LuckyDrawProps {
  participants: Participant[];
}

export const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [pool, setPool] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [repeatable, setRepeatable] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPool(participants);
  }, [participants]);

  const startDraw = () => {
    if (pool.length === 0) return;
    
    setIsDrawing(true);
    setWinner(null);
    
    let count = 0;
    const maxCount = 30; // Number of cycles in animation
    const interval = 80;

    timerRef.current = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * pool.length));
      count++;

      if (count >= maxCount) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        const finalIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[finalIndex];
        
        setWinner(selected);
        setWinners(prev => [selected, ...prev]);
        setIsDrawing(false);
        
        if (!repeatable) {
          setPool(prev => prev.filter(p => p.id !== selected.id));
        }

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
      }
    }, interval);
  };

  const reset = () => {
    setPool(participants);
    setWinners([]);
    setWinner(null);
    setIsDrawing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Settings & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">抽籤設定:</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={repeatable}
                onChange={(e) => setRepeatable(e.target.checked)}
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">允許重複中獎</span>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium border border-slate-200"
          >
            <RotateCcw size={16} />
            重設獎池
          </button>
          <button
            onClick={startDraw}
            disabled={isDrawing || pool.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Trophy size={18} />
            {isDrawing ? '正在抽取...' : '開始抽籤'}
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border-8 border-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>

        <AnimatePresence mode="wait">
          {isDrawing ? (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <div className="text-indigo-400 text-xl font-mono mb-4 tracking-widest uppercase">正在隨機挑選...</div>
              <div className="text-white text-6xl md:text-8xl font-bold tracking-tight">
                {pool[displayIndex]?.name || '---'}
              </div>
            </motion.div>
          ) : winner ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="inline-block p-4 bg-yellow-400 rounded-full mb-6 shadow-lg shadow-yellow-400/20"
              >
                <Trophy size={48} className="text-yellow-900" />
              </motion.div>
              <div className="text-yellow-400 text-2xl font-bold mb-2 uppercase tracking-widest">恭喜中獎者</div>
              <div className="text-white text-7xl md:text-9xl font-black tracking-tighter mb-4">
                {winner.name}
              </div>
            </motion.div>
          ) : (
            <div className="text-center">
              <div className="text-slate-500 text-lg mb-4">獎池剩餘 {pool.length} 人</div>
              <div className="text-slate-300 text-4xl font-light">準備好開始了嗎？</div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Winners History */}
      {winners.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b border-slate-100 pb-4">
            <UserCheck size={20} className="text-indigo-500" />
            <h2>中獎名單 ({winners.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {winners.map((w, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={`${w.id}-${idx}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {winners.length - idx}
                </div>
                <span className="font-medium text-slate-700">{w.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
