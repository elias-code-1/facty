import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, Save, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { useAdminLanding } from '../../hooks/useAdminLanding';
import { useToast } from '../../hooks/useToast';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import DynamicIcon from '../../components/ui/DynamicIcon';

const TextInput = ({ label, dbKey, val, setVal, onSave, isSaving, isTextarea = false }: { 
  label: string, 
  dbKey: string, 
  val: string, 
  setVal: (v: string) => void, 
  onSave: (key: string, value: string) => void, 
  isSaving: boolean, 
  isTextarea?: boolean 
}) => {
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
          onClick={() => onSave(dbKey, val)}
          disabled={isSaving}
          className="self-start bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <span className="animate-spin">⏳</span> : <Save size={16} />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

const ImageInput = ({ label, dbKey, currentUrl, onUpload, isSaving }: { 
  label: string, 
  dbKey: string, 
  currentUrl: string, 
  onUpload: (key: string, e: React.ChangeEvent<HTMLInputElement>) => void, 
  isSaving: boolean 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          {isSaving && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="animate-spin text-indigo-600">⏳</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => onUpload(dbKey, e)}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
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

const JsonListEditor = ({ label, dbKey, items, setItems, onSave, isSaving, template }: { 
  label: string, 
  dbKey: string, 
  items: any[], 
  setItems: (items: any[]) => void, 
  onSave: (key: string, value: any) => void, 
  isSaving: boolean, 
  template: any 
}) => {
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
          onClick={() => onSave(dbKey, items)}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <span className="animate-spin">⏳</span> : <Save size={16} />}
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

export default function AdminLanding() {
  const { content, loading, updateContent, uploadImage } = useAdminLanding();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Navbar');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const tabs = ['Navbar', 'Hero', 'Problème', 'Solution', 'Produit', 'Bénéfices', 'FAQ', 'CTA', 'Footer'];

  const [localValues, setLocalValues] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    if (!loading && content && !isInitialized) {
      const newLocalValues: Record<string, any> = {};
      Object.keys(content).forEach(key => {
        if (key.endsWith('_items') || key === 'solution_stats' || key === 'product_use_cases' || key === 'faq_items') {
          try {
            newLocalValues[key] = typeof content[key] === 'string' ? JSON.parse(content[key]) : content[key];
          } catch {
            newLocalValues[key] = content[key];
          }
        } else {
          newLocalValues[key] = content[key];
        }
      });
      setLocalValues(newLocalValues);
      setIsInitialized(true);
    }
  }, [content, loading, isInitialized]);

  if (loading && !isInitialized) return <FullPageSpinner />;

  const handleSaveText = async (key: string, value: string) => {
    setIsSaving(key);
    try {
      await updateContent(key, value);
      showToast('Contenu mis à jour', 'success');
    } catch (error: any) {
      console.error('Update error:', error);
      showToast(`Erreur : ${error.message || 'Mise à jour échouée'}`, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const handleSaveJson = async (key: string, value: any) => {
    setIsSaving(key);
    try {
      await updateContent(key, JSON.stringify(value));
      showToast('Liste mise à jour', 'success');
    } catch (error: any) {
      console.error('Update error:', error);
      showToast(`Erreur : ${error.message || 'Mise à jour échouée'}`, 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const handleImageUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(key);
    try {
      const url = await uploadImage(key, file);
      if (url) {
        updateLocalValue(key, url);
      }
      showToast('Image mise à jour', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'upload', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const updateLocalValue = (key: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
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
              <ImageInput 
                label="Logo (URL ou Upload)" 
                dbKey="nav_logo_url" 
                currentUrl={localValues.nav_logo_url}
                onUpload={handleImageUpload}
                isSaving={isSaving === 'nav_logo_url'}
              />
              <TextInput 
                label="Texte bouton CTA" 
                dbKey="nav_cta_text" 
                val={localValues.nav_cta_text || ''}
                setVal={(v) => updateLocalValue('nav_cta_text', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'nav_cta_text'}
              />
            </motion.div>
          )}

          {activeTab === 'Hero' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre principal" 
                dbKey="hero_headline" 
                val={localValues.hero_headline || ''}
                setVal={(v) => updateLocalValue('hero_headline', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'hero_headline'}
                isTextarea 
              />
              <TextInput 
                label="Sous-titre" 
                dbKey="hero_subheadline" 
                val={localValues.hero_subheadline || ''}
                setVal={(v) => updateLocalValue('hero_subheadline', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'hero_subheadline'}
                isTextarea 
              />
              <TextInput 
                label="Bouton principal" 
                dbKey="hero_cta_primary" 
                val={localValues.hero_cta_primary || ''}
                setVal={(v) => updateLocalValue('hero_cta_primary', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'hero_cta_primary'}
              />
              <TextInput 
                label="Bouton secondaire" 
                dbKey="hero_cta_secondary" 
                val={localValues.hero_cta_secondary || ''}
                setVal={(v) => updateLocalValue('hero_cta_secondary', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'hero_cta_secondary'}
              />
              <TextInput 
                label="Preuve sociale" 
                dbKey="hero_social_proof" 
                val={localValues.hero_social_proof || ''}
                setVal={(v) => updateLocalValue('hero_social_proof', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'hero_social_proof'}
              />
              <ImageInput 
                label="Mockup Application" 
                dbKey="hero_mockup_url" 
                currentUrl={localValues.hero_mockup_url}
                onUpload={handleImageUpload}
                isSaving={isSaving === 'hero_mockup_url'}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-6 mt-6">
                <div className="space-y-4">
                  <TextInput 
                    label="Feature 1 - Texte" 
                    dbKey="hero_feature_1" 
                    val={localValues.hero_feature_1 || ''}
                    setVal={(v) => updateLocalValue('hero_feature_1', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_1'}
                  />
                  <TextInput 
                    label="Feature 1 - Icône (Lucide)" 
                    dbKey="hero_feature_1_icon" 
                    val={localValues.hero_feature_1_icon || ''}
                    setVal={(v) => updateLocalValue('hero_feature_1_icon', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_1_icon'}
                  />
                </div>
                <div className="space-y-4">
                  <TextInput 
                    label="Feature 2 - Texte" 
                    dbKey="hero_feature_2" 
                    val={localValues.hero_feature_2 || ''}
                    setVal={(v) => updateLocalValue('hero_feature_2', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_2'}
                  />
                  <TextInput 
                    label="Feature 2 - Icône (Lucide)" 
                    dbKey="hero_feature_2_icon" 
                    val={localValues.hero_feature_2_icon || ''}
                    setVal={(v) => updateLocalValue('hero_feature_2_icon', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_2_icon'}
                  />
                </div>
                <div className="space-y-4">
                  <TextInput 
                    label="Feature 3 - Texte" 
                    dbKey="hero_feature_3" 
                    val={localValues.hero_feature_3 || ''}
                    setVal={(v) => updateLocalValue('hero_feature_3', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_3'}
                  />
                  <TextInput 
                    label="Feature 3 - Icône (Lucide)" 
                    dbKey="hero_feature_3_icon" 
                    val={localValues.hero_feature_3_icon || ''}
                    setVal={(v) => updateLocalValue('hero_feature_3_icon', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'hero_feature_3_icon'}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Problème' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre de la section" 
                dbKey="problem_title" 
                val={localValues.problem_title || ''}
                setVal={(v) => updateLocalValue('problem_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'problem_title'}
              />
              <TextInput 
                label="Sous-titre" 
                dbKey="problem_subtitle" 
                val={localValues.problem_subtitle || ''}
                setVal={(v) => updateLocalValue('problem_subtitle', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'problem_subtitle'}
              />
              <JsonListEditor 
                label="Points de douleur" 
                dbKey="problem_items" 
                items={localValues.problem_items || []}
                setItems={(items) => updateLocalValue('problem_items', items)}
                onSave={handleSaveJson}
                isSaving={isSaving === 'problem_items'}
                template={{ icon: 'AlertTriangle', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Solution' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre de la section" 
                dbKey="solution_title" 
                val={localValues.solution_title || ''}
                setVal={(v) => updateLocalValue('solution_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'solution_title'}
              />
              <JsonListEditor 
                label="Chiffres clés" 
                dbKey="solution_stats" 
                items={localValues.solution_stats || []}
                setItems={(items) => updateLocalValue('solution_stats', items)}
                onSave={handleSaveJson}
                isSaving={isSaving === 'solution_stats'}
                template={{ number: '0', label: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Produit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre de la section" 
                dbKey="product_title" 
                val={localValues.product_title || ''}
                setVal={(v) => updateLocalValue('product_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'product_title'}
              />
              <TextInput 
                label="Sous-titre" 
                dbKey="product_subtitle" 
                val={localValues.product_subtitle || ''}
                setVal={(v) => updateLocalValue('product_subtitle', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'product_subtitle'}
              />
              <ImageInput 
                label="Screenshot Principal (Gauche)" 
                dbKey="product_screenshot_1" 
                currentUrl={localValues.product_screenshot_1}
                onUpload={handleImageUpload}
                isSaving={isSaving === 'product_screenshot_1'}
              />
              <ImageInput 
                label="Screenshot Secondaire (Haut Droite)" 
                dbKey="product_screenshot_2" 
                currentUrl={localValues.product_screenshot_2}
                onUpload={handleImageUpload}
                isSaving={isSaving === 'product_screenshot_2'}
              />
              <ImageInput 
                label="Screenshot Tertiaire (Bas Droite)" 
                dbKey="product_screenshot_3" 
                currentUrl={localValues.product_screenshot_3}
                onUpload={handleImageUpload}
                isSaving={isSaving === 'product_screenshot_3'}
              />
              <JsonListEditor 
                label="Cas d'usage" 
                dbKey="product_use_cases" 
                items={localValues.product_use_cases || []}
                setItems={(items) => updateLocalValue('product_use_cases', items)}
                onSave={handleSaveJson}
                isSaving={isSaving === 'product_use_cases'}
                template={{ icon: 'Lightbulb', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'Bénéfices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre de la section" 
                dbKey="benefits_title" 
                val={localValues.benefits_title || ''}
                setVal={(v) => updateLocalValue('benefits_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'benefits_title'}
              />
              <JsonListEditor 
                label="Liste des bénéfices" 
                dbKey="benefits_items" 
                items={localValues.benefits_items || []}
                setItems={(items) => updateLocalValue('benefits_items', items)}
                onSave={handleSaveJson}
                isSaving={isSaving === 'benefits_items'}
                template={{ icon: 'Sparkles', title: '', description: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'FAQ' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre de la section" 
                dbKey="faq_title" 
                val={localValues.faq_title || ''}
                setVal={(v) => updateLocalValue('faq_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'faq_title'}
              />
              <JsonListEditor 
                label="Questions fréquentes" 
                dbKey="faq_items" 
                items={localValues.faq_items || []}
                setItems={(items) => updateLocalValue('faq_items', items)}
                onSave={handleSaveJson}
                isSaving={isSaving === 'faq_items'}
                template={{ question: '', answer: '' }} 
              />
            </motion.div>
          )}

          {activeTab === 'CTA' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TextInput 
                label="Titre" 
                dbKey="cta_title" 
                val={localValues.cta_title || ''}
                setVal={(v) => updateLocalValue('cta_title', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'cta_title'}
              />
              <TextInput 
                label="Sous-titre" 
                dbKey="cta_subtitle" 
                val={localValues.cta_subtitle || ''}
                setVal={(v) => updateLocalValue('cta_subtitle', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'cta_subtitle'}
              />
              <TextInput 
                label="Texte du bouton" 
                dbKey="cta_button" 
                val={localValues.cta_button || ''}
                setVal={(v) => updateLocalValue('cta_button', v)}
                onSave={handleSaveText}
                isSaving={isSaving === 'cta_button'}
              />
            </motion.div>
          )}

          {activeTab === 'Footer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <TextInput 
                  label="Email de contact" 
                  dbKey="footer_contact_email" 
                  val={localValues.footer_contact_email || ''}
                  setVal={(v) => updateLocalValue('footer_contact_email', v)}
                  onSave={handleSaveText}
                  isSaving={isSaving === 'footer_contact_email'}
                />
                <TextInput 
                  label="Numéro de téléphone (laisser vide pour désactiver)" 
                  dbKey="footer_contact_phone" 
                  val={localValues.footer_contact_phone || ''}
                  setVal={(v) => updateLocalValue('footer_contact_phone', v)}
                  onSave={handleSaveText}
                  isSaving={isSaving === 'footer_contact_phone'}
                />
              </div>

              <div className="border-t border-slate-100 pt-8 mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Réseaux Sociaux</h3>
                <p className="text-sm text-slate-500 mb-6">Entrez les URLs complètes (ex: https://facebook.com/votrepage). Laissez vide pour masquer l'icône.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <TextInput 
                    label="Facebook" 
                    dbKey="footer_social_facebook" 
                    val={localValues.footer_social_facebook || ''}
                    setVal={(v) => updateLocalValue('footer_social_facebook', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_facebook'}
                  />
                  <TextInput 
                    label="Twitter / X" 
                    dbKey="footer_social_twitter" 
                    val={localValues.footer_social_twitter || ''}
                    setVal={(v) => updateLocalValue('footer_social_twitter', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_twitter'}
                  />
                  <TextInput 
                    label="Instagram" 
                    dbKey="footer_social_instagram" 
                    val={localValues.footer_social_instagram || ''}
                    setVal={(v) => updateLocalValue('footer_social_instagram', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_instagram'}
                  />
                  <TextInput 
                    label="LinkedIn" 
                    dbKey="footer_social_linkedin" 
                    val={localValues.footer_social_linkedin || ''}
                    setVal={(v) => updateLocalValue('footer_social_linkedin', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_linkedin'}
                  />
                  <TextInput 
                    label="YouTube" 
                    dbKey="footer_social_youtube" 
                    val={localValues.footer_social_youtube || ''}
                    setVal={(v) => updateLocalValue('footer_social_youtube', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_youtube'}
                  />
                  <TextInput 
                    label="GitHub" 
                    dbKey="footer_social_github" 
                    val={localValues.footer_social_github || ''}
                    setVal={(v) => updateLocalValue('footer_social_github', v)}
                    onSave={handleSaveText}
                    isSaving={isSaving === 'footer_social_github'}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <TextInput 
                  label="Tagline" 
                  dbKey="footer_tagline" 
                  val={localValues.footer_tagline || ''}
                  setVal={(v) => updateLocalValue('footer_tagline', v)}
                  onSave={handleSaveText}
                  isSaving={isSaving === 'footer_tagline'}
                />
                <TextInput 
                  label="Copyright" 
                  dbKey="footer_copyright" 
                  val={localValues.footer_copyright || ''}
                  setVal={(v) => updateLocalValue('footer_copyright', v)}
                  onSave={handleSaveText}
                  isSaving={isSaving === 'footer_copyright'}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}