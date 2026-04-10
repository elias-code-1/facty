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
import StepsSection from '../components/landing/StepsSection';
import SecuritySection from '../components/landing/SecuritySection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

interface SEOLandingProps {
  title: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function SEOLanding({ title, description, heroTitle, heroSubtitle }: SEOLandingProps) {
  const { content, loading } = useLanding();

  // On crée une copie du contenu pour injecter nos overrides
  const seoContent: Record<string, any> = {
    ...content,
    hero_title: heroTitle || content.hero_title,
    hero_subtitle: heroSubtitle || content.hero_subtitle,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-20 bg-slate-50 animate-pulse"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <div className="h-12 bg-slate-100 rounded-xl w-3/4 mb-6 animate-pulse"></div>
            <div className="h-6 bg-slate-50 rounded w-1/2 mb-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>{title} — Facty</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Navbar content={seoContent} />
      <HeroSection content={seoContent} />
      <ProblemSection content={seoContent} />
      <SolutionSection content={seoContent} />
      <ProductSection content={seoContent} />
      <StepsSection content={seoContent} />
      <BenefitsSection content={seoContent} />
      <SecuritySection content={seoContent} />
      {(seoContent.testimonials_visible === 'true' || seoContent.testimonials_visible === true || seoContent.testimonials_visible === undefined) && (
        <TestimonialsSection content={seoContent} />
      )}
      <FaqSection content={seoContent} />
      <CtaSection content={seoContent} />
      <Footer content={seoContent} />
    </div>
  );
}
