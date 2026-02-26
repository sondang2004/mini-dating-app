import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, CalendarCheck } from 'lucide-react';
import { StorageService } from '../services/storage';
import { findFirstOverlap } from '../utils/date';
import type { Profile, Message, Availability, TimeSlot } from '../types/models';

interface ChatInterfaceProps {
  currentUser: { id: string; username: string };
  partner: Profile;
  onBack: () => void;
  otherAvailability?: Availability;
  myAvailability?: Availability;
  onAcceptDate?: (slot: TimeSlot) => void;
}

export function ChatInterface({
  currentUser,
  partner,
  onBack,
  otherAvailability,
  myAvailability,
  onAcceptDate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const fetchedMessages = await StorageService.getMessages(
          currentUser.id,
          partner.id
        );
        if (isMounted) setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Load initial messages
    fetchMessages();

    // Polling for new messages (simulated real-time)
    const interval = setInterval(fetchMessages, 2000); // 2s polling interval for KV store friendliness

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser.id, partner.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      senderId: currentUser.id,
      receiverId: partner.id,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Save asynchronously
    try {
      await StorageService.addMessage(newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const overlap =
    myAvailability && otherAvailability
      ? findFirstOverlap(myAvailability.slots, otherAvailability.slots)
      : null;
  const hasProposal =
    !overlap && otherAvailability && otherAvailability.slots.length > 0;
  const proposalSlot = hasProposal
    ? otherAvailability!.slots[otherAvailability!.slots.length - 1]
    : null;

  return (
    <div className="flex flex-col h-full w-full max-w-md bg-gray-50 absolute top-0 left-0 right-0 bottom-0 z-50 overflow-hidden">
      {/* Minimal App Bar */}
      <header className="flex items-center px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 shrink-0 z-10 sticky top-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 ml-2 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-pink-400 p-[2px] shrink-0 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-rose-500 uppercase">
              {partner.name.charAt(0)}
            </div>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h2 className="text-base font-bold text-gray-900 truncate leading-tight">
              {partner.name}
            </h2>
            <p className="text-[11px] text-rose-500 font-medium truncate mt-0.5">
              {partner.job || partner.education
                ? `${partner.job || ''} ${partner.education ? `• ${partner.education}` : ''}`.trim()
                : 'Match'}
            </p>
          </div>
        </div>
      </header>

      {/* Date Proposal / Confirmation Banner */}
      {overlap ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 p-4 shrink-0 shadow-sm z-10 relative flex items-center justify-center">
          <p className="text-sm text-emerald-800 font-bold flex items-center gap-2">
            ✅ Date confirmed: {overlap.date} {overlap.startTime}-
            {overlap.endTime}
          </p>
        </div>
      ) : proposalSlot ? (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 p-5 shrink-0 shadow-sm z-10 relative">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <CalendarCheck size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-slate-800 font-medium leading-relaxed">
                <span className="font-bold text-rose-600">Date Proposal:</span>{' '}
                "I'd like to meet you on{' '}
                <span className="font-bold text-slate-900">
                  {proposalSlot.date}
                </span>
                ,{' '}
                <span className="font-bold text-slate-900">
                  {proposalSlot.startTime}-{proposalSlot.endTime}
                </span>
                ... Do you agree?"
              </p>
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() => onAcceptDate?.(proposalSlot)}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-5 py-2.5 rounded-full font-bold shadow-sm shadow-rose-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  Accept & Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 relative isolate bg-stone-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-6 mt-4 mb-4">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner border-4 border-white overflow-hidden">
              {partner.avatarUrl ? (
                <img
                  src={partner.avatarUrl}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                '💭'
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Say Hello!</h3>
            <p className="text-sm text-gray-500">
              Break the ice and start coordinating your first date with{' '}
              {partner.name.split(' ')[0]}.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.senderId === currentUser.id;
          const showAvatar =
            !isMine &&
            (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {!isMine && (
                  <div className="w-6 h-6 shrink-0 flex items-end">
                    {showAvatar && (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase shadow-sm overflow-hidden">
                        {partner.avatarUrl ? (
                          <img
                            src={partner.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          partner.name.charAt(0)
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-3xl ${
                    isMine
                      ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-sm shadow-[0_2px_8px_rgba(244,63,94,0.25)] border-transparent'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words font-medium">
                    {msg.text}
                  </p>
                  <p
                    className={`text-[10px] mt-1 text-right ${isMine ? 'text-rose-100' : 'text-gray-400'}`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] pb-6 relative z-10">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-stone-100 hover:bg-stone-50 focus:bg-white text-gray-900 border border-transparent focus:border-rose-300 focus:ring-4 focus:ring-rose-100/50 rounded-full px-5 py-3.5 text-[15px] outline-none transition-all placeholder-gray-400 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
