import React, { useState } from 'react';
import { useDisguise } from '../../context/DisguiseContext';
import { ShieldAlert, CloudSun, EyeOff } from 'lucide-react';

export default function DisguiseScreen() {
  const { exitDisguise } = useDisguise();
  const [calcInput, setCalcInput] = useState('0');
  const [prevVal, setPrevVal] = useState(null);
  const [operation, setOperation] = useState(null);
  const [clearNext, setClearNext] = useState(false);

  // Hidden secret code: type '777' and '=' to return back
  const handleDigit = (digit) => {
    if (calcInput === '0' || clearNext) {
      setCalcInput(digit);
      setClearNext(false);
    } else {
      setCalcInput(prev => prev + digit);
    }
  };

  const handleOp = (op) => {
    setPrevVal(parseFloat(calcInput));
    setOperation(op);
    setClearNext(true);
  };

  const handleEquals = () => {
    if (calcInput === '777') {
      exitDisguise();
      return;
    }
    if (!operation || prevVal === null) return;
    const current = parseFloat(calcInput);
    let result = 0;
    if (operation === '+') result = prevVal + current;
    if (operation === '-') result = prevVal - current;
    if (operation === '×') result = prevVal * current;
    if (operation === '÷') result = current !== 0 ? prevVal / current : 'Error';
    setCalcInput(String(result));
    setPrevVal(null);
    setOperation(null);
    setClearNext(true);
  };

  const handleClear = () => {
    setCalcInput('0');
    setPrevVal(null);
    setOperation(null);
    setClearNext(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Harmless Header */}
      <div className="w-full max-w-sm flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <CloudSun className="w-5 h-5 text-amber-400" />
          <span>Calculator • Standard Utility</span>
        </div>
        <button
          onClick={exitDisguise}
          title="Exit Disguise (or type 777 =)"
          className="text-xs text-slate-600 hover:text-slate-400 px-2 py-1 rounded border border-slate-800"
        >
          Exit Disguise
        </button>
      </div>

      {/* Realistic Functional Calculator */}
      <div className="w-full max-w-sm bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="h-16 bg-slate-900 rounded-xl p-3 flex items-end justify-end text-3xl font-mono text-emerald-400 overflow-x-auto mb-6 border border-slate-800">
          {calcInput}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button onClick={handleClear} className="col-span-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-rose-400">
            C
          </button>
          <button onClick={() => setCalcInput(prev => String(parseFloat(prev) * -1))} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold">
            ±
          </button>
          <button onClick={() => handleOp('÷')} className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white">
            ÷
          </button>

          {['7', '8', '9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-lg border border-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOp('×')} className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white">
            ×
          </button>

          {['4', '5', '6'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-lg border border-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOp('-')} className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white">
            -
          </button>

          {['1', '2', '3'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-lg border border-slate-800">
              {d}
            </button>
          ))}
          <button onClick={() => handleOp('+')} className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white">
            +
          </button>

          <button onClick={() => handleDigit('0')} className="col-span-2 p-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-lg border border-slate-800">
            0
          </button>
          <button onClick={() => handleDigit('.')} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-semibold text-lg border border-slate-800">
            .
          </button>
          <button onClick={handleEquals} className="p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white">
            =
          </button>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-600">
        Tip: Press discrete <span className="font-mono text-slate-500">Ctrl+Q</span> or top-right button to restore app.
      </div>
    </div>
  );
}

