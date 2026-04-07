import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, Save, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { useAdminLanding } from '../../hooks/useAdminLanding';
import { useToast } from '../../hooks/useToast';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import DynamicIcon from '../../components/ui/DynamicIcon';

export default function AdminLanding() {
  const { content, loading, updateContent, uploadImage } = useAdminLanding();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Navbar');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const tabs = ['Navbar', 'Hero', 'Problème', 'Solution', 'Produit', 'Bénéfices', 'FAQ', 'CTA', 'Footer'];

  if (loading) return <FullPageSpinner />;

  const handleSaveText = async (key: string, value: string) => {
    setIsSaving(key);
    try {
      await updateContent(key, value);
      showToast('Contenu mis à jour', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const handleSaveJson = async (key: string, value: any) => {
    setIsSaving(key);
    try {
      await updateContent(key, JSON.stringify(value));
      showToast('Liste mise à jour', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const handleImageUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(key);
    try {
      await uploadImage(key, file);
      showToast('Image mise à jour', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'upload', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const TextInput = ({ label, dbKey, isTextarea = false }: { label: string, dbKey: string, isTextarea?: boolean }) => {
    const [val, setVal] = useState(content[dbKey] || '');
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <div className="flex gap-3">
          {isTextarea ? (
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}
          <button
            onClick={() => handleSaveText(dbKey, val)}
            disabled={isSaving === dbKey}
            className="self-start bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving === dbKey ? <span className="animate-spin">⏳</span> : <Save size={16} />}
            Sauvegarder
          </button>
        </div>
      </div>
    );
  };

  const ImageInput = ({ label, dbKey }: { label: string, dbKey: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUrl = content[dbKey];

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <div className="flex items-start gap-6">
          <div className="w-48 h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
            {currentUrl ? (
              <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-slate-400" size={32} />
            )}
            {isSaving === dbKey && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <span className="animate-spin text-indigo-600">⏳</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImageUpload(dbKey, e)}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving === dbKey}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Changer l'image
            </button>
            <p className="text-xs text-slate-500 mt-2">Format recommandé : JPG, PNG ou WebP. Max 500KB (compression auto).</p>
          </div>
        </div>
      </div>
    );
  };

  const JsonListEditor = ({ label, dbKey, template }: { label: string, dbKey: string, template: any }) => {
    const [items, setItems] = useState<any[]>(content[dbKey] || []);

    const addItem = () => setItems([...items, { ...template }]);
    const updateItem = (index: number, field: string, value: string) => {
      const newItems = [...items];
      newItems[index][field] = value;
      setItems(newItems);
    };
    const removeItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    };

    return (
      <div className="mb-8 border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-bold text-slate-800">{label}</label>
          <button
            onClick={() => handleSaveJson(dbKey, items)}
            disabled={isSaving === dbKey}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving === dbKey ? <span className="animate-spin">⏳</span> : <Save size={16} />}
            Sauvegarder la liste
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
              <button
                onClick={() => removeItem(index)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                {Object.keys(template).map(key => (
                  <div key={key} className={key === 'description' || key === 'answer' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">
                      {key === 'icon' ? 'Icône (nom Lucide)' : key}
                    </label>
                    {key === 'description' || key === 'answer' ? (
                      <textarea
                        value={item[key]}
                        onChange={(e) => updateItem(index, key, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        rows={2}
                      />
                    ) : key === 'icon' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                          <DynamicIcon name={item[key]} size={20} />
                        </div>
                        <input
                          type="text"
                          value={item[key]}
                          placeholder="Ex: Rocket, Zap..."
                          onChange={(e) => updateItem(index, key, e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item[key]}
                        onChange={(e) => updateItem(index, key, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter un item
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="text-indigo-600" />
            Landing Page
          </h1>
          <p className="text-slate-500 mt-1">Modifiez le contenu de votre page publique</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Voir la landing
          <ExternalLink size={18} />
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="active-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'Navbar' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ImageInput label="Logo (URL ou Upload)" dbKey="nav_logo_url" />
              <TextInput label="Texte bouton CTA" dbKey="nav_cta_text" />
            </motion.div>
          )}

          {activeTab === 'Hero' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre principal" dbKey="hero_headline" isTextarea />
              <TextInput label="Sous-titre" dbKey="hero_subheadline" isTextarea />
              <TextInput label="Bouton principal" dbKey="hero_cta_primary" />
              <TextInput label="Bouton secondaire" dbKey="hero_cta_secondary" />
              <TextInput label="Preuve sociale" dbKey="hero_social_proof" />
              <ImageInput label="Mockup Application" dbKey="hero_mockup_url" />
            </motion.div>
          )}

          {activeTab === 'Problème' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre de la section" dbKey="problem_title" />
              <TextInput label="Sous-titre" dbKey="problem_subtitle" />
              <JsonListEditor 
                label="Points de douleur" 
                dbKey="problem_items" 
                template={{ icon: 'AlertTriangle', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Solution' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre de la section" dbKey="solution_title" />
              <JsonListEditor 
                label="Chiffres clés" 
                dbKey="solution_stats" 
                template={{ number: '0', label: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Produit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre de la section" dbKey="product_title" />
              <TextInput label="Sous-titre" dbKey="product_subtitle" />
              <ImageInput label="Screenshot Principal (Gauche)" dbKey="product_screenshot_1" />
              <ImageInput label="Screenshot Secondaire (Haut Droite)" dbKey="product_screenshot_2" />
              <ImageInput label="Screenshot Tertiaire (Bas Droite)" dbKey="product_screenshot_3" />
              <JsonListEditor 
                label="Cas d'usage" 
                dbKey="product_use_cases" 
                template={{ icon: 'Lightbulb', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Bénéfices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre de la section" dbKey="benefits_title" />
              <JsonListEditor 
                label="Liste des bénéfices" 
                dbKey="benefits_items" 
                template={{ icon: 'Sparkles', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'FAQ' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre de la section" dbKey="faq_title" />
              <JsonListEditor 
                label="Questions fréquentes" 
                dbKey="faq_items" 
                template={{ question: '', answer: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'CTA' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Titre" dbKey="cta_title" />
              <TextInput label="Sous-titre" dbKey="cta_subtitle" />
              <TextInput label="Texte du bouton" dbKey="cta_button" />
            </motion.div>
          )}

          {activeTab === 'Footer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput label="Tagline" dbKey="footer_tagline" />
              <TextInput label="Copyright" dbKey="footer_copyright" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}