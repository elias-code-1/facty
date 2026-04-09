import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useSupport } from '../hooks/useSupport';
import { useLanding } from '../hooks/useLanding';

export default function Contact() {
  const { content } = useLanding();
  const { submitTicket } = useSupport();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Tous les champs sont requis.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Veuillez entrer un email valide.');
      return;
    }

    if (formData.message.length < 10) {
      setError('Le message doit faire au moins 10 caractères.');
      return;
    }

    if (formData.subject === 'Choisir un sujet...' || !formData.subject) {
      setError('Veuillez choisir un sujet.');
      return;
    }

    setLoading(true);
    try {
      await submitTicket(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar content={content} />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-12 text-center bg-gradient-to-b from-white to-indigo-50/40">
          <div className="max-w-4xl mx-auto px-6">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-1 text-sm font-medium mb-6"
            >
              💬 Support
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight"
            >
              Contactez-nous
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto"
            >
              Une question ? Un problème ? Notre équipe vous répond rapidement.
            </motion.p>
          </div>
        </section>

        {/* Form Section */}
        <section className="px-6 pb-20">
          <div className="max-w-xl mx-auto">
            {success ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-white rounded-2xl shadow-sm p-12 border border-slate-100 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="text-green-500 w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Message envoyé !</h2>
                <p className="text-slate-500 mb-8">
                  Nous vous répondrons à <span className="font-semibold text-slate-700">{formData.email}</span> dans les plus brefs délais.
                </p>
                <Link 
                  to="/"
                  className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Retour à l'accueil
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                    <input 
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input 
                      type="email"
                      placeholder="jean@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sujet *</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    >
                      <option>Choisir un sujet...</option>
                      <option>Question générale</option>
                      <option>Problème technique</option>
                      <option>Suggestion d'amélioration</option>
                      <option>Demande de partenariat</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">Message *</label>
                      <span className="text-[10px] text-slate-400 font-mono">{formData.message.length}/500 caractères</span>
                    </div>
                    <textarea 
                      rows={5}
                      maxLength={500}
                      placeholder="Décrivez votre question ou problème..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm flex items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white w-full rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer content={content} />
    </div>
  );
}
