import React, { useState, useRef, useMemo } from 'react';
import { Upload, ClipboardList, Users, Trash2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { Participant } from '../types';
import { cn } from '../utils';

interface ParticipantInputProps {
  onParticipantsChange: (participants: Participant[]) => void;
  participants: Participant[];
}

const SAMPLE_NAMES = [
  '陳小明', '林美玲', '張大華', '李曉華', '王志明', 
  '黃雅婷', '周杰倫', '蔡依林', '林俊傑', '張惠妹',
  '陳小明', '李曉華' // Intentionally add duplicates
];

export const ParticipantInput: React.FC<ParticipantInputProps> = ({ onParticipantsChange, participants }) => {
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    const names = textInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const newParticipants: Participant[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
    }));

    onParticipantsChange([...participants, ...newParticipants]);
    setTextInput('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        const newParticipants: Participant[] = data
          .flat()
          .map(n => n?.trim())
          .filter(n => n && n.length > 0)
          .map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            name,
          }));
        
        onParticipantsChange([...participants, ...newParticipants]);
      },
      header: false,
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSampleData = () => {
    const sampleParticipants: Participant[] = SAMPLE_NAMES.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
    }));
    onParticipantsChange([...participants, ...sampleParticipants]);
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    onParticipantsChange(uniqueParticipants);
  };

  const clearAll = () => {
    onParticipantsChange([]);
  };

  // Identify duplicates for UI marking
  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    participants.forEach(p => {
      counts.set(p.name, (counts.get(p.name) || 0) + 1);
    });
    return new Set([...counts.entries()].filter(([_, count]) => count > 1).map(([name]) => name));
  }, [participants]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <ClipboardList size={20} />
              <h2>貼上姓名名單</h2>
            </div>
            <button
              onClick={loadSampleData}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-colors"
            >
              <UserPlus size={14} />
              載入範例名單
            </button>
          </div>
          <textarea
            className="w-full h-40 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm"
            placeholder="每行一個姓名..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            加入名單
          </button>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
            <Upload size={20} />
            <h2>上傳 CSV 檔案</h2>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all p-6"
          >
            <Upload className="text-slate-400 mb-2" size={32} />
            <p className="text-sm text-slate-500 text-center">點擊或拖拽 CSV 檔案至此</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Participant List Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Users size={20} />
            <h2>目前名單 ({participants.length} 人)</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {duplicateNames.size > 0 && (
              <button
                onClick={removeDuplicates}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-amber-200"
              >
                <AlertCircle size={14} />
                移除重複姓名 ({duplicateNames.size} 組)
              </button>
            )}
            {participants.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} />
                清空全部
              </button>
            )}
          </div>
        </div>
        
        {participants.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            尚未加入任何成員
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto p-1">
            {participants.map((p) => {
              const isDuplicate = duplicateNames.has(p.name);
              return (
                <span
                  key={p.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-all",
                    isDuplicate 
                      ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  )}
                >
                  {p.name}
                  {isDuplicate && <AlertCircle size={12} className="text-amber-500" />}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
