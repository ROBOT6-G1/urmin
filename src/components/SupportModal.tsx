import React, { useState } from 'react';
import { X, Headphones, Send, Image as ImageIcon, CheckCircle2, MessageSquare, CornerDownRight } from 'lucide-react';
import { UserProfile, SupportTicket } from '../types';

interface SupportModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  tickets?: SupportTicket[];
}

export const SupportModal: React.FC<SupportModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmitTicket,
  tickets = [],
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'my_tickets'>('send');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const myTickets = tickets.filter(
    (t) => t.userId === user.id || t.userEmail.toLowerCase() === user.email.toLowerCase()
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmitTicket({
      userId: user.id,
      userEmail: user.email,
      subject: subject || 'Fanampiana Service Client DEVWEBIA',
      message,
      imageUrl: imagePreview || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
      setImagePreview(null);
      setActiveTab('my_tickets');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Headphones className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Service Client DEVWEBIA</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Manana olana na fanontaniana? Handefaso hafatra miaraka amin'ny sary ny ekipanay.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'send'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mandefa Hafatra</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_tickets')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'my_tickets'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hafatra & Valinteny ({myTickets.length})</span>
          </button>
        </div>

        {activeTab === 'send' ? (
          submitted ? (
            <div className="p-6 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2 text-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-base">Hafatra voaray soa aman-tsara!</div>
              <p className="text-xs text-slate-300">
                Hamaly anao eto amin'ny support DEVWEBIA na amin'ny mailaka ({user.email}) ny Admin!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Sujet / Lohateny :
                </label>
                <input
                  type="text"
                  placeholder="Ohatra: Olana tamin'ny paiement / Domaine"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Hafatra (Message texte) :
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hazavao eto ny olana sedrainao..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Image Upload Component */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Ampidiro Sary / Capture d'écran (Image) :
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 cursor-pointer font-bold transition-all">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>Safidio sary</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-purple-500">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Mandefa Hafatra amin'ny Support</span>
              </button>
            </form>
          )
        ) : (
          /* TAB: My Tickets & Replies */
          <div className="space-y-3 text-xs">
            {myTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Tsy mbola nandefa hafatra amin'ny support ianao.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold border-b border-slate-900 pb-2">
                      <span className="text-amber-300 truncate">{t.subject}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          t.reply || t.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.reply || t.status === 'resolved' ? 'Voavaly' : 'Miandry valiny'}
                      </span>
                    </div>

                    <p className="text-slate-300 whitespace-pre-wrap">{t.message}</p>

                    {/* Admin Reply Card */}
                    {t.reply ? (
                      <div className="mt-2 bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl space-y-1 text-emerald-100">
                        <div className="font-extrabold text-emerald-400 text-[11px] flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Valin'ny Admin Horlando (DEVWEBIA) :</span>
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap pl-5">{t.reply}</p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic pt-1">
                        Efa azony Admin ny hafatrao ary hamaly anao haingana amin'ity pejy ity izy.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

