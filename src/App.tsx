/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Info, RefreshCcw, Scale, Ruler, MessageSquare, History, Trash2, Save } from 'lucide-react';

type BMICategory = '低体重' | '普通体重' | '肥満（1度）' | '肥満（2度以上）' | null;

interface HistoryItem {
  id: string;
  date: string;
  height: number;
  weight: number;
  bmi: number;
  category: BMICategory;
  memo: string;
}

export default function App() {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [result, setResult] = useState<{ bmi: number; category: BMICategory } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bmi_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bmi_history', JSON.stringify(history));
  }, [history]);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height) / 100; // cm to m
    const w = parseFloat(weight);

    if (h > 0 && w > 0) {
      const bmi = parseFloat((w / (h * h)).toFixed(1));
      let category: BMICategory = '普通体重';
      if (bmi < 18.5) category = '低体重';
      else if (bmi >= 18.5 && bmi < 25) category = '普通体重';
      else if (bmi >= 25 && bmi < 30) category = '肥満（1度）';
      else category = '肥満（2度以上）';

      setResult({ bmi, category });
    }
  };

  const saveToHistory = () => {
    if (!result) return;
    
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString('ja-JP'),
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: result.bmi,
      category: result.category,
      memo: memo,
    };

    setHistory([newItem, ...history]);
    setMemo('');
    // Optional: show a success state or just clear the current result
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm('履歴をすべて削除してもよろしいですか？')) {
      setHistory([]);
    }
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setMemo('');
    setResult(null);
  };

  const categoryColors = {
    '低体重': 'text-blue-500 bg-blue-50 border-blue-200',
    '普通体重': 'text-green-500 bg-green-50 border-green-200',
    '肥満（1度）': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    '肥満（2度以上）': 'text-red-500 bg-red-50 border-red-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
        >
          {/* ヘッダー */}
          <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              className="absolute -right-4 -top-4"
            >
              <Calculator size={120} />
            </motion.div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  BMI計算機
                </h1>
                <p className="text-indigo-100 mt-1 text-sm">
                  体格指数とメモを記録
                </p>
              </div>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="履歴を表示"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={calculateBMI} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 身長入力 */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      身長 (cm)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="例: 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg font-medium"
                    />
                  </div>

                  {/* 体重入力 */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      体重 (kg)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="例: 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  計算する
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all active:scale-95"
                  title="リセット"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* 結果セクション */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 pt-8 border-t border-slate-100 space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">あなたのBMI</p>
                      <motion.p 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-black text-slate-800"
                      >
                        {result.bmi}
                      </motion.p>
                    </div>

                    <div className={`inline-flex items-center px-4 py-2 rounded-full border font-bold text-sm ${categoryColors[result.category!]}`}>
                      {result.category}
                    </div>

                    {/* BMIスケールビジュアル */}
                    <div className="relative pt-4 pb-2">
                      <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: '18.5%' }} />
                        <div className="h-full bg-green-400" style={{ width: '6.5%' }} />
                        <div className="h-full bg-yellow-400" style={{ width: '5%' }} />
                        <div className="h-full bg-red-400" style={{ width: '70%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                      </div>
                    </div>
                  </div>

                  {/* メモ入力 */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      メモを残す
                    </label>
                    <textarea
                      placeholder="例: 健康診断の結果、食後など..."
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm min-h-[80px] resize-none"
                    />
                  </div>

                  <button
                    onClick={saveToHistory}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    履歴に保存
                  </button>

                  <p className="text-slate-500 text-[11px] flex items-center justify-center gap-1.5 bg-slate-50 py-3 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    理想的なBMI範囲は18.5〜24.9です。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 履歴セクション */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  計算履歴
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    すべて削除
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <History className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm">履歴はまだありません</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group"
                    >
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-start pr-8">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-slate-800">{item.bmi}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${categoryColors[item.category!]}`}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-[11px] text-slate-500 font-medium">
                        <span>身長: {item.height}cm</span>
                        <span>体重: {item.weight}kg</span>
                      </div>
                      {item.memo && (
                        <div className="bg-white p-3 rounded-xl text-xs text-slate-600 border border-slate-100 italic">
                          "{item.memo}"
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* フッター情報 */}
        {!showHistory && (
          <div className="text-center px-4">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              BMI（体格指数）は、肥満度を判定するための国際的な指標です。身長と体重から算出され、体脂肪の推定や健康リスクの把握に役立ちます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
