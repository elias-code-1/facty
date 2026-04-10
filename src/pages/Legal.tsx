import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useLanding } from '../hooks/useLanding';

export default function Legal() {
  const { content } = useLanding();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Mentions Légales — Facty</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar content={content} />
      
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-black text-slate-800 mb-8 tracking-tight">Mentions Légales</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Présentation du site</h2>
            <p>
              Le site <strong>Facty</strong> est une plateforme de gestion de facturation éditée par <strong>Logonova Agency</strong>.
            </p>
            <p>
              <strong>Directeur de la publication :</strong> Logonova Agency<br />
              <strong>Contact :</strong> logonovaagency@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Google Cloud Platform (Cloud Run)</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Limitation de responsabilité</h2>
            <p>
              Facty s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise à jour des informations diffusées sur ce site. Facty se réserve le droit de corriger, à tout moment et sans préavis, le contenu.
            </p>
          </section>
        </div>
      </main>

      <Footer content={content} />
    </div>
  );
}
