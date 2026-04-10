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
              Nous collectons les données suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adresse email</li>
              <li>Nom et informations de profil</li>
              <li>Données clients saisies dans l’application</li>
              <li>Données de facturation</li>
              <li>Données techniques (adresse IP, navigateur)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Utilisation des données</h2>
            <p>
              Les données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir le service</li>
              <li>Gérer les comptes utilisateurs</li>
              <li>Améliorer l’application</li>
              <li>Assurer la sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Conservation des données</h2>
            <p>
              Les données sont conservées :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pendant la durée d’utilisation du service</li>
              <li>Ou jusqu’à suppression du compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Partage des données</h2>
            <p>
              Les données peuvent être partagées avec :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des services techniques (hébergement, email) uniquement dans le cadre du fonctionnement du service</li>
            </ul>
            <p className="mt-4 font-semibold">
              Aucune donnée n’est vendue à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Sécurité</h2>
            <p>
              Nous mettons en place des mesures techniques pour protéger les données :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement</li>
              <li>Accès sécurisé</li>
              <li>Contrôle d’accès</li>
            </ul>
            <p className="mt-4 italic">
              Cependant, aucun système n’est totalement inviolable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">6. Droits des utilisateurs</h2>
            <p>
              L’utilisateur peut :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accéder à ses données</li>
              <li>Modifier ses données</li>
              <li>Demander la suppression de ses données</li>
            </ul>
            <p className="mt-4">
              Toute demande peut être faite à : <strong>logonovaagency@gmail.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">7. Cookies</h2>
            <p>
              Le site peut utiliser des cookies pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Améliorer l’expérience utilisateur</li>
              <li>Analyser l’utilisation du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">8. Modifications</h2>
            <p>
              Cette politique peut être modifiée à tout moment. Les utilisateurs seront informés en cas de changement majeur.
            </p>
          </section>
        </div>
      </main>

      <Footer content={content} />
    </div>
  );
}
