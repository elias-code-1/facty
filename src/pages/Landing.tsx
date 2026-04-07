import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanding } from '../hooks/useLanding';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import ProductSection from '../components/landing/ProductSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import FaqSection from '../components/landing/FaqSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';
import { updateSEO } from '../utils/seo';

export default function Landing() {
  const { content, loading } = useLanding();

  useEffect(() => {
    updateSEO({
      title: 'Factures pro en 30 secondes',
      description: 'Facty - Créez et gérez vos factures professionnelles simplement. Gratuit pour commencer.'
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-20 bg-slate-50 animate-pulse"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <div className="h-12 bg-slate-100 rounded-xl w-3/4 mb-6 animate-pulse"></div>
            <div className="h-6 bg-slate-50 rounded w-1/2 mb-12 animate-pulse"></div>
            <div className="h-16 bg-slate-100 rounded-xl w-48 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>Facty — Factures pro en 30s</title>
        <meta name="description" content="Créez, envoyez et suivez vos factures en quelques clics. Gagnez du temps et soyez payé plus rapidement avec Facty." />
      </Helmet>

      <Navbar content={content} />
      <HeroSection content={content} />
      <ProblemSection content={content} />
      <SolutionSection content={content} />
      <ProductSection content={content} />
      <BenefitsSection content={content} />
      <FaqSection content={content} />
      <CtaSection content={content} />
      <Footer content={content} />
    </div>
  );
}