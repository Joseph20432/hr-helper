import React, { useState } from 'react';
import { Users, LayoutGrid, Shuffle, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Participant, Group } from '../types';
import { cn } from '../utils';

interface GroupingProps {
  participants: Participant[];
}

export const Grouping: React.FC<GroupingProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGrouping, setIsGrouping] = useState(false);

  const generateGroups = () => {
    if (participants.length === 0) return;
    
    setIsGrouping(true);
    
    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    const newGroups: Group[] = [];
    const numGroups = Math.ceil(shuffled.length / groupSize);
    
    for (let i = 0; i < numGroups; i++) {
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${i + 1} 組`,
        members: shuffled.slice(i * groupSize, (i + 1) * groupSize),
      });
    }
    
    // Simulate a bit of delay for effect
    setTimeout(() => {
      setGroups(newGroups);
      setIsGrouping(false);
    }, 600);
  };

  const downloadResults = () => {
    // Create CSV content
    // Header: Group Name, Member Name
    const csvRows = [['組別', '姓名']];
    
    groups.forEach(group => {
      group.members.forEach(member => {
        csvRows.push([group.name, member.name]);
      });
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '分組結果.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">每組人數</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max="20"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="w-32 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-lg font-bold text-slate-700 w-8">{groupSize}</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">預計組數</label>
            <span className="text-lg font-bold text-slate-700">
              {Math.ceil(participants.length / groupSize)} 組
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {groups.length > 0 && (
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium border border-slate-200"
            >
              <Download size={16} />
              下載結果
            </button>
          )}
          <button
            onClick={generateGroups}
            disabled={isGrouping || participants.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Shuffle size={18} className={cn(isGrouping && "animate-spin")} />
            {isGrouping ? '正在分組...' : '自動分組'}
          </button>
        </div>
      </div>

      {/* Results Visualization */}
      {groups.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-24 flex flex-col items-center justify-center text-slate-400">
          <LayoutGrid size={48} className="mb-4 opacity-20" />
          <p>設定好人數後點擊「自動分組」開始</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, gIdx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: gIdx * 0.05 }}
              key={group.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-700">{group.name}</h3>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {group.members.length} 人
                </span>
              </div>
              <div className="p-5 flex-1">
                <ul className="space-y-2">
                  {group.members.map((member, mIdx) => (
                    <li key={member.id} className="flex items-center gap-3 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span className="text-sm font-medium">{member.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
