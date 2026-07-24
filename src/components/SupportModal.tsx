import React, { useState } from 'react';
import { X, Headphones, Send, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { UserProfile, SupportTicket } from '../types';

interface SupportModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmitTicket,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

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
      onClose();
    }, 2000);
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

        {submitted ? (
          <div className="p-6 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2 text-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-base">Hafatra voaray soa aman-tsara!</div>
            <p className="text-xs text-slate-300">
              Hamaly anao amin'ny mailaka ({user.email}) haingana indrindra ny support DEVWEBIA.
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

            {/* Image Upload Component required */}
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
        )}
      </div>
    </div>
  );
};
