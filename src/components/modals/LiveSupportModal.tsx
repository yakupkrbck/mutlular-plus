import React, { useState } from 'react';
import { X, Send, Headphones, CheckCheck } from 'lucide-react';

interface LiveSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveSupportModal: React.FC<LiveSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: 'Merhaba! Mutlular Plus Canlı Destek hattına hoş geldiniz. Size nasıl yardımcı olabilirim?',
      time: 'Az önce',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      time: 'Az önce',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: 'Talebiniz müşteri temsilcimize iletildi. Mutlular Plus ile ilgili her konuda sizlere 7/24 destek vermekten mutluluk duyarız.',
          time: 'Az önce',
        },
      ]);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] relative">
        {/* Chat Header */}
        <div className="bg-rose-600 p-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-black leading-tight">
                Mutlular Plus Destek
              </h3>
              <p className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Çevrimiçi Temsilci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-neutral-50 text-[12px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-2.5 rounded-2xl shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-br-xs'
                    : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-neutral-400 mt-0.5 px-1 flex items-center gap-1">
                {m.time}
                {m.sender === 'user' && (
                  <CheckCheck className="w-3 h-3 text-rose-600" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSend}
          className="p-2.5 bg-white border-t border-neutral-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-[12px] font-medium outline-none focus:bg-neutral-50 focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 hover:bg-rose-700 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
