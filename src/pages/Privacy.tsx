import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { useLanding } from '../hooks/useLanding';

export default function Privacy() {
  const { content } = useLanding();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Politique de Confidentialité — Facty</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar content={content} />
      
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-black text-slate-800 mb-8 tracking-tight">Politique de Confidentialité</h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Collecte des données</h2>
            <p>
              Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte : nom, adresse email, et informations de facturation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Utilisation des données</h2>
            <p>
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gérer votre compte et vos factures.</li>
              <li>Vous envoyer des notifications liées à votre activité.</li>
              <li>Améliorer nos services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Protection des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité robustes pour protéger vos informations personnelles contre tout accès non autorisé. Vos données sont stockées de manière sécurisée via Supabase (PostgreSQL).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à logonovaagency@gmail.com.
            </p>
          </section>
        </div>
      </main>

      <Footer content={content} />
    </div>
  );
}
