import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanding } from '../hooks/useLanding';
import { seoService, SEOPageData } from '../services/seoService';
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
import FullPageSpinner from '../components/ui/FullPageSpinner';

export default function SEOLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { content, loading: landingLoading } = useLanding();
  const [pageData, setPageData] = useState<SEOPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      setLoading(true);
      const data = await seoService.getPageBySlug(slug);
      
      if (!data) {
        // Rediriger vers 404 si la page n'existe pas en base
        navigate('/error/404', { replace: true });
        return;
      }
      
      setPageData(data);
      setLoading(false);
    };

    fetchPage();
  }, [slug, navigate]);

  if (loading || landingLoading) {
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

  if (!pageData) return null;

  // On crée une copie du contenu pour injecter nos overrides de la base de données
  const seoContent: Record<string, any> = {
    ...content,
    hero_headline: pageData.hero_title || content.hero_headline,
    hero_subheadline: pageData.hero_subtitle || content.hero_subheadline,
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>{pageData.title} — Facty</title>
        <meta name="description" content={pageData.description} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Navbar content={seoContent} />
      <HeroSection content={seoContent} />
      <div id="problème">
        <ProblemSection content={seoContent} />
      </div>
      <div id="solution">
        <SolutionSection content={seoContent} />
      </div>
      <div id="produit">
        <ProductSection content={seoContent} />
      </div>
      <div id="étapes">
        <StepsSection content={seoContent} />
      </div>
      <div id="avantages">
        <BenefitsSection content={seoContent} />
      </div>
      <SecuritySection content={seoContent} />
      {(seoContent.testimonials_visible === 'true' || seoContent.testimonials_visible === true || seoContent.testimonials_visible === undefined) && (
        <TestimonialsSection content={seoContent} />
      )}
      <div id="faq">
        <FaqSection content={seoContent} />
      </div>
      <CtaSection content={seoContent} />
      <Footer content={seoContent} />
    </div>
  );
}
