import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useLanding } from '../hooks/useLanding';

export default function Legal() {
  const { content } = useLanding();

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@factyapp.com';

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
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Éditeur du site</h2>
            <p>
              Le site et l’application <strong>Facty</strong> sont édités par :
            </p>
            <p>
              <strong>Logonova Agency</strong><br />
              <strong>Email :</strong> {supportEmail}
            </p>
            <p className="italic text-sm">
              (ci-après « l’Éditeur »)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Hébergement</h2>
            <p>
              L’application est hébergée par des prestataires techniques tiers garantissant la disponibilité et la sécurité des services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Objet du service</h2>
            <p>
              <strong>Facty</strong> est une application SaaS permettant :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La création de factures</li>
              <li>La gestion de clients</li>
              <li>L’automatisation de l’envoi de documents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Accès au service</h2>
            <p>
              Le service est accessible 24h/24 et 7j/7, sauf interruption pour maintenance ou cas de force majeure.
            </p>
            <p>
              L’Éditeur ne saurait être tenu responsable en cas :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>D’interruption temporaire</li>
              <li>De bug technique ou d’indisponibilité du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Responsabilité</h2>
            <p>
              L’utilisateur est seul responsable :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des données qu’il saisit</li>
              <li>Des factures générées</li>
              <li>De l’usage qu’il fait du service</li>
            </ul>
            <p className="mt-4">
              L’Éditeur ne garantit pas :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La conformité légale des factures selon chaque pays</li>
              <li>L’absence totale d’erreurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">6. Propriété intellectuelle</h2>
            <p>
              Tous les éléments du site (design, logo, code, textes) sont la propriété exclusive de <strong>Logonova Agency</strong>.
            </p>
            <p>
              Toute reproduction est interdite sans autorisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">7. Données personnelles</h2>
            <p>
              Les données personnelles sont collectées et traitées conformément à la Politique de Confidentialité disponible sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">8. Droit applicable</h2>
            <p>
              Le présent site est soumis au droit applicable selon la juridiction de l’Éditeur.
            </p>
          </section>
        </div>
      </main>

      <Footer content={content} />
    </div>
  );
}
