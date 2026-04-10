export interface SEOPageConfig {
  slug: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  category: 'profession' | 'geo' | 'feature' | 'general';
}

export const SEO_PAGES: SEOPageConfig[] = [
  // --- GÉO AFRIQUE ---
  {
    slug: 'logiciel-facturation-togo',
    title: 'Logiciel de Facturation au Togo (Lomé)',
    description: 'La solution de facturation préférée des entreprises au Togo. Gérez vos factures en Franc CFA simplement à Lomé et partout au Togo.',
    heroTitle: 'Facturez en toute simplicité au Togo',
    heroSubtitle: 'Adapté au marché togolais, Facty vous aide à gérer vos clients et vos paiements en un clin d\'œil.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-cote-divoire',
    title: 'Logiciel de Facturation en Côte d\'Ivoire (Abidjan)',
    description: 'Optimisez la gestion de votre entreprise en Côte d\'Ivoire. Facturation conforme, envoi WhatsApp et suivi des paiements à Abidjan.',
    heroTitle: 'Le n°1 de la facturation en Côte d\'Ivoire',
    heroSubtitle: 'Rejoignez des centaines d\'entrepreneurs ivoiriens qui automatisent leur gestion avec Facty.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-senegal',
    title: 'Logiciel de Facturation au Sénégal (Dakar)',
    description: 'Gérez vos factures pro au Sénégal. Solution rapide pour les PME et freelances à Dakar. Conforme OHADA et simple d\'utilisation.',
    heroTitle: 'Simplifiez votre facturation au Sénégal',
    heroSubtitle: 'Gagnez du temps sur votre administratif et concentrez-vous sur votre croissance à Dakar.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-benin',
    title: 'Logiciel de Facturation au Bénin (Cotonou)',
    description: 'La meilleure application de facturation pour les entreprises au Bénin. Créez des factures professionnelles à Cotonou en quelques secondes.',
    heroTitle: 'Facturez comme un pro au Bénin',
    heroSubtitle: 'Une solution moderne et intuitive pour les entrepreneurs béninois.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-cameroun',
    title: 'Logiciel de Facturation au Cameroun (Douala/Yaoundé)',
    description: 'Solution de facturation complète pour le Cameroun. Gérez vos devis et factures en Franc CFA à Douala, Yaoundé et partout ailleurs.',
    heroTitle: 'La facturation intelligente au Cameroun',
    heroSubtitle: 'Automatisez vos relances et suivez votre trésorerie en temps réel au Cameroun.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-burkina-faso',
    title: 'Logiciel de Facturation au Burkina Faso',
    description: 'Gérez votre entreprise au Burkina Faso avec Facty. Facturation simple et rapide pour les PME burkinabè.',
    heroTitle: 'Facturez plus vite au Burkina Faso',
    heroSubtitle: 'L\'outil indispensable pour les entrepreneurs du Burkina.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-mali',
    title: 'Logiciel de Facturation au Mali (Bamako)',
    description: 'Simplifiez la gestion de vos factures au Mali. Idéal pour les commerçants et prestataires de services à Bamako.',
    heroTitle: 'Gérez vos factures facilement au Mali',
    heroSubtitle: 'Facty s\'adapte aux besoins des entreprises maliennes.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-gabon',
    title: 'Logiciel de Facturation au Gabon',
    description: 'La solution de facturation moderne pour le Gabon. Créez des factures pro et suivez vos paiements en Franc CFA.',
    heroTitle: 'Facturation pro pour les entreprises au Gabon',
    heroSubtitle: 'Gagnez en efficacité et en professionnalisme au Gabon.',
    category: 'geo'
  },

  // --- MÉTIERS / NICHES ---
  {
    slug: 'facturation-developpeur-freelance',
    title: 'Logiciel de Facturation pour Développeurs Freelance',
    description: 'Le meilleur outil pour les développeurs : facturation automatique, gestion de projets et suivi des paiements par carte ou virement.',
    heroTitle: 'Facturez vos lignes de code en 30s',
    heroSubtitle: 'Un outil pensé par des techs pour des techs. Simple, propre, efficace.',
    category: 'profession'
  },
  {
    slug: 'facturation-graphiste-designer',
    title: 'Logiciel de Facturation pour Graphistes et Designers',
    description: 'Créez des factures aussi belles que vos créations. Facty aide les designers à gérer leurs devis et factures avec élégance.',
    heroTitle: 'La facturation au service du design',
    heroSubtitle: 'Présentez des factures pro qui reflètent votre talent créatif.',
    category: 'profession'
  },
  {
    slug: 'facturation-consultant',
    title: 'Logiciel de Facturation pour Consultants',
    description: 'Gérez vos missions de conseil en toute sérénité. Suivi du temps, facturation récurrente et relances automatiques.',
    heroTitle: 'L\'outil de facturation des consultants experts',
    heroSubtitle: 'Professionnalisez votre activité de conseil avec Facty.',
    category: 'profession'
  },
  {
    slug: 'facturation-architecte',
    title: 'Logiciel de Facturation pour Architectes',
    description: 'Gérez vos honoraires et vos situations de travaux simplement. Un outil adapté aux besoins spécifiques des cabinets d\'architecture.',
    heroTitle: 'Simplifiez la gestion de vos projets d\'architecture',
    heroSubtitle: 'De l\'esquisse à la réception, gérez votre facturation sans stress.',
    category: 'profession'
  },
  {
    slug: 'facturation-avocat',
    title: 'Logiciel de Facturation pour Avocats et Juristes',
    description: 'Facturation sécurisée et conforme pour les professions juridiques. Gérez vos dossiers et vos honoraires en toute confidentialité.',
    heroTitle: 'La facturation rigoureuse pour les avocats',
    heroSubtitle: 'Gagnez du temps sur votre administratif pour vous concentrer sur vos dossiers.',
    category: 'profession'
  },
  {
    slug: 'facturation-agence-marketing',
    title: 'Logiciel de Facturation pour Agences Marketing',
    description: 'Gérez vos clients récurrents et vos forfaits mensuels. Automatisez votre facturation et suivez votre rentabilité.',
    heroTitle: 'Boostez la rentabilité de votre agence',
    heroSubtitle: 'Automatisez vos factures mensuelles et ne manquez plus aucun paiement.',
    category: 'profession'
  },
  {
    slug: 'facturation-artisan',
    title: 'Logiciel de Facturation pour Artisans et BTP',
    description: 'Créez vos devis et factures sur le chantier depuis votre mobile. Simple, rapide et robuste pour tous les corps de métier.',
    heroTitle: 'La facturation qui vous suit sur le chantier',
    heroSubtitle: 'Transformez vos devis en factures en un clic, même en déplacement.',
    category: 'profession'
  },
  {
    slug: 'facturation-photographe',
    title: 'Logiciel de Facturation pour Photographes',
    description: 'Gérez vos shootings et vos cessions de droits. Un outil simple pour les photographes indépendants et studios.',
    heroTitle: 'Capturez vos paiements plus rapidement',
    heroSubtitle: 'Gérez votre activité photo avec un outil intuitif et moderne.',
    category: 'profession'
  },
  {
    slug: 'facturation-coach-formateur',
    title: 'Logiciel de Facturation pour Coachs et Formateurs',
    description: 'Facturez vos séances de coaching et vos formations. Gérez vos inscriptions et vos paiements en ligne simplement.',
    heroTitle: 'Simplifiez la gestion de vos formations',
    heroSubtitle: 'Concentrez-vous sur la transmission, Facty s\'occupe de vos factures.',
    category: 'profession'
  },
  {
    slug: 'facturation-e-commerce',
    title: 'Logiciel de Facturation pour E-commerce',
    description: 'Générez des factures automatiques pour vos ventes en ligne. Intégration facile et gestion des stocks simplifiée.',
    heroTitle: 'Automatisez la facturation de votre boutique',
    heroSubtitle: 'Vendez, Facty s\'occupe de générer les factures pour vos clients.',
    category: 'profession'
  },

  // --- FONCTIONNALITÉS ---
  {
    slug: 'facture-whatsapp',
    title: 'Envoyer vos Factures par WhatsApp',
    description: 'Unique ! Envoyez vos factures directement sur le WhatsApp de vos clients. Augmentez vos chances d\'être payé rapidement.',
    heroTitle: 'La facturation qui passe par WhatsApp',
    heroSubtitle: 'Soyez là où sont vos clients. Envoyez vos factures en un clic sur WhatsApp.',
    category: 'feature'
  },
  {
    slug: 'facturation-automatique-saas',
    title: 'Logiciel de Facturation Automatique (SaaS)',
    description: 'Automatisez tout votre cycle de facturation. De la création à la relance, Facty s\'occupe de tout pour vous.',
    heroTitle: 'Passez votre facturation en pilote automatique',
    heroSubtitle: 'Gagnez des heures de travail chaque mois grâce à l\'automatisation.',
    category: 'feature'
  },
  {
    slug: 'generateur-devis-gratuit',
    title: 'Générateur de Devis Gratuit en Ligne',
    description: 'Créez des devis professionnels en quelques secondes. Transformez-les en factures dès que votre client accepte.',
    heroTitle: 'Créez des devis qui font vendre',
    heroSubtitle: 'Professionnalisez vos propositions commerciales avec nos modèles gratuits.',
    category: 'feature'
  },
  {
    slug: 'suivi-paiement-client',
    title: 'Outil de Suivi des Paiements Clients',
    description: 'Ne perdez plus aucune trace de vos paiements. Visualisez en un clin d\'œil qui vous doit quoi et depuis quand.',
    heroTitle: 'Maîtrisez votre trésorerie en temps réel',
    heroSubtitle: 'Un tableau de bord clair pour suivre tous vos encaissements.',
    category: 'feature'
  },
  {
    slug: 'relance-facture-impayee',
    title: 'Automatisation des Relances de Factures Impayées',
    description: 'Réduisez vos délais de paiement. Facty envoie des relances automatiques et polies à vos clients en retard.',
    heroTitle: 'Dites adieu aux factures impayées',
    heroSubtitle: 'Laissez Facty faire le travail ingrat de relance pour vous.',
    category: 'feature'
  },

  // --- LONG TAIL / QUESTIONS ---
  {
    slug: 'comment-faire-une-facture-pro',
    title: 'Comment faire une facture professionnelle ?',
    description: 'Guide complet : mentions obligatoires, structure et modèles. Apprenez à créer des factures irréprochables pour votre entreprise.',
    heroTitle: 'Tout savoir pour créer vos factures',
    heroSubtitle: 'Suivez notre guide et utilisez nos outils pour ne faire aucune erreur.',
    category: 'general'
  },
  {
    slug: 'mentions-obligatoires-facture',
    title: 'Les mentions obligatoires sur une facture en 2026',
    description: 'Vérifiez la conformité de vos factures. Liste exhaustive des mentions légales pour éviter les amendes et litiges.',
    heroTitle: 'Vos factures sont-elles conformes ?',
    heroSubtitle: 'Découvrez la liste des mentions indispensables pour être en règle.',
    category: 'general'
  },
  {
    slug: 'facturation-auto-entrepreneur-guide',
    title: 'Guide de la Facturation pour Auto-Entrepreneur',
    description: 'Tout ce qu\'il faut savoir sur la facturation en micro-entreprise : TVA, mentions spéciales et outils recommandés.',
    heroTitle: 'La facturation simplifiée pour auto-entrepreneurs',
    heroSubtitle: 'Gérez votre micro-entreprise sans prise de tête avec Facty.',
    category: 'general'
  },
  // --- NOUVEAUX MÉTIERS ---
  {
    slug: 'facturation-plombier',
    title: 'Logiciel de Facturation pour Plombiers',
    description: 'Créez vos devis et factures de plomberie en un instant. Idéal pour les interventions d\'urgence et chantiers.',
    heroTitle: 'La facturation fluide pour les plombiers',
    heroSubtitle: 'Gérez vos clients et vos paiements sans fuite de temps.',
    category: 'profession'
  },
  {
    slug: 'facturation-electricien',
    title: 'Logiciel de Facturation pour Électriciens',
    description: 'Établissez des devis électriques précis et facturez vos installations en quelques clics.',
    heroTitle: 'Mettez votre facturation sous tension',
    heroSubtitle: 'Un outil simple et puissant pour les professionnels de l\'électricité.',
    category: 'profession'
  },
  {
    slug: 'facturation-peintre',
    title: 'Logiciel de Facturation pour Peintres en Bâtiment',
    description: 'Gérez vos métrés et vos factures de peinture simplement. Professionnalisez vos devis pour gagner plus de chantiers.',
    heroTitle: 'Colorez votre gestion administrative',
    heroSubtitle: 'Facty vous aide à peindre un futur serein pour votre entreprise.',
    category: 'profession'
  },
  {
    slug: 'facturation-chauffeur-vtc',
    title: 'Logiciel de Facturation pour Chauffeurs VTC et Taxis',
    description: 'Générez des factures conformes pour vos courses privées et entreprises. Simple et rapide sur mobile.',
    heroTitle: 'La facturation qui roule pour les VTC',
    heroSubtitle: 'Émettez vos factures entre deux courses en quelques secondes.',
    category: 'profession'
  },
  {
    slug: 'facturation-restaurant',
    title: 'Logiciel de Facturation pour Restaurants et Cafés',
    description: 'Gérez vos factures fournisseurs et vos ventes simplement. Un complément idéal à votre logiciel de caisse.',
    heroTitle: 'Mettez de l\'ordre dans vos factures resto',
    heroSubtitle: 'Une gestion simplifiée pour vous concentrer sur votre cuisine.',
    category: 'profession'
  },
  {
    slug: 'facturation-hotel',
    title: 'Logiciel de Facturation pour Hôtels et Gîtes',
    description: 'Facturez vos nuitées et services additionnels en toute simplicité. Idéal pour les établissements indépendants.',
    heroTitle: 'La facturation accueillante pour l\'hôtellerie',
    heroSubtitle: 'Gérez vos réservations et vos factures sans fausse note.',
    category: 'profession'
  },
  {
    slug: 'facturation-medecin',
    title: 'Logiciel de Facturation pour Médecins et Cabinets Médicaux',
    description: 'Gérez vos honoraires et vos factures patients en toute sécurité. Un outil discret et efficace pour les praticiens.',
    heroTitle: 'La facturation saine pour les médecins',
    heroSubtitle: 'Simplifiez votre administratif pour mieux soigner vos patients.',
    category: 'profession'
  },
  {
    slug: 'facturation-dentiste',
    title: 'Logiciel de Facturation pour Dentistes',
    description: 'Gérez vos actes et vos factures dentaires simplement. Un outil moderne pour les cabinets dentaires.',
    heroTitle: 'Redonnez le sourire à votre comptabilité',
    heroSubtitle: 'Une gestion claire et précise pour votre cabinet dentaire.',
    category: 'profession'
  },
  {
    slug: 'facturation-immobilier',
    title: 'Logiciel de Facturation pour Agences Immobilières',
    description: 'Gérez vos commissions et vos factures de gestion locative. Un outil puissant pour les agents immobiliers.',
    heroTitle: 'Bâtissez une facturation solide',
    heroSubtitle: 'L\'outil indispensable pour les professionnels de l\'immobilier.',
    category: 'profession'
  },
  {
    slug: 'facturation-agence-voyage',
    title: 'Logiciel de Facturation pour Agences de Voyage',
    description: 'Facturez vos forfaits touristiques et billets simplement. Gérez vos clients et vos paiements internationaux.',
    heroTitle: 'Faites voyager votre facturation',
    heroSubtitle: 'Un outil sans frontières pour les agences de voyage.',
    category: 'profession'
  },
  {
    slug: 'facturation-salle-de-sport',
    title: 'Logiciel de Facturation pour Salles de Sport et Coachs',
    description: 'Gérez vos abonnements et vos séances de coaching. Automatisez vos factures mensuelles simplement.',
    heroTitle: 'Musclez votre gestion financière',
    heroSubtitle: 'Plus de sport, moins de paperasse avec Facty.',
    category: 'profession'
  },
  {
    slug: 'facturation-coiffeur',
    title: 'Logiciel de Facturation pour Salons de Coiffure',
    description: 'Gérez vos prestations et vos ventes de produits. Un outil simple pour les coiffeurs indépendants et salons.',
    heroTitle: 'Une facturation bien coupée',
    heroSubtitle: 'Simplifiez la gestion de votre salon en quelques clics.',
    category: 'profession'
  },
  {
    slug: 'facturation-nettoyage',
    title: 'Logiciel de Facturation pour Entreprises de Nettoyage',
    description: 'Gérez vos contrats d\'entretien et vos interventions ponctuelles. Facturation rapide et suivi des paiements.',
    heroTitle: 'Faites place nette dans vos factures',
    heroSubtitle: 'Une gestion propre et efficace pour votre entreprise de propreté.',
    category: 'profession'
  },
  {
    slug: 'facturation-securite',
    title: 'Logiciel de Facturation pour Agences de Sécurité',
    description: 'Gérez vos prestations de gardiennage et de surveillance. Facturation conforme et suivi rigoureux.',
    heroTitle: 'Sécurisez vos revenus avec Facty',
    heroSubtitle: 'Une gestion administrative robuste pour les pros de la sécurité.',
    category: 'profession'
  },
  {
    slug: 'facturation-logistique',
    title: 'Logiciel de Facturation pour Logistique et Transport',
    description: 'Gérez vos bons de livraison et vos factures de transport. Un outil fluide pour les transporteurs.',
    heroTitle: 'La facturation qui livre à temps',
    heroSubtitle: 'Optimisez votre flux administratif comme votre flux logistique.',
    category: 'profession'
  },
  // --- NOUVEAUX PAYS ---
  {
    slug: 'logiciel-facturation-niger',
    title: 'Logiciel de Facturation au Niger (Niamey)',
    description: 'La solution de facturation moderne pour les entreprises au Niger. Gérez vos factures en Franc CFA à Niamey.',
    heroTitle: 'Facturez en toute confiance au Niger',
    heroSubtitle: 'Un outil adapté aux besoins des entrepreneurs nigériens.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-tchad',
    title: 'Logiciel de Facturation au Tchad (N\'Djamena)',
    description: 'Simplifiez la gestion de vos factures au Tchad. Idéal pour les PME et commerçants à N\'Djamena.',
    heroTitle: 'La facturation simplifiée au Tchad',
    heroSubtitle: 'Gagnez en efficacité avec Facty au Tchad.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-guinee',
    title: 'Logiciel de Facturation en Guinée (Conakry)',
    description: 'Gérez vos factures pro en Guinée. Solution rapide pour les entrepreneurs à Conakry.',
    heroTitle: 'Facturez comme un pro en Guinée',
    heroSubtitle: 'L\'outil de gestion indispensable à Conakry.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-congo-rdc',
    title: 'Logiciel de Facturation en RDC (Kinshasa)',
    description: 'La solution de facturation pour les entreprises en République Démocratique du Congo. Gérez vos factures à Kinshasa.',
    heroTitle: 'Simplifiez votre gestion en RDC',
    heroSubtitle: 'Facty accompagne la croissance des entreprises congolaises.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-congo-brazzaville',
    title: 'Logiciel de Facturation au Congo-Brazzaville',
    description: 'Gérez vos factures pro au Congo. Solution rapide pour les PME à Brazzaville et Pointe-Noire.',
    heroTitle: 'Facturez plus vite au Congo',
    heroSubtitle: 'Un outil moderne pour les entrepreneurs congolais.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-mauritanie',
    title: 'Logiciel de Facturation en Mauritanie (Nouakchott)',
    description: 'Simplifiez la gestion de vos factures en Mauritanie. Idéal pour les prestataires à Nouakchott.',
    heroTitle: 'La facturation facile en Mauritanie',
    heroSubtitle: 'Gagnez du temps sur votre administratif en Mauritanie.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-madagascar',
    title: 'Logiciel de Facturation à Madagascar (Antananarivo)',
    description: 'Gérez vos factures pro à Madagascar. Solution rapide pour les entrepreneurs à Antananarivo.',
    heroTitle: 'Facturez comme un pro à Madagascar',
    heroSubtitle: 'L\'outil de gestion moderne à Madagascar.',
    category: 'geo'
  },
  // --- NOUVELLES NICHES MÉTIERS (SUITE) ---
  {
    slug: 'facturation-traducteur-interprete',
    title: 'Logiciel de Facturation pour Traducteurs et Interprètes',
    description: 'Facturez vos mots, pages ou heures de traduction simplement. Gestion multi-devises pour vos clients internationaux.',
    heroTitle: 'La facturation sans frontières pour traducteurs',
    heroSubtitle: 'Gérez vos projets linguistiques et vos factures en un clin d\'œil.',
    category: 'profession'
  },
  {
    slug: 'facturation-redacteur-web',
    title: 'Logiciel de Facturation pour Rédacteurs Web et Copywriters',
    description: 'Le meilleur outil pour les rédacteurs : facturation au mot ou au projet, suivi des paiements et relances.',
    heroTitle: 'Facturez vos textes en quelques secondes',
    heroSubtitle: 'Un outil simple pour les professionnels de l\'écrit.',
    category: 'profession'
  },
  {
    slug: 'facturation-community-manager',
    title: 'Logiciel de Facturation pour Community Managers',
    description: 'Gérez vos forfaits mensuels de gestion de réseaux sociaux. Automatisez vos factures récurrentes.',
    heroTitle: 'La facturation sociale et efficace',
    heroSubtitle: 'Gagnez du temps sur votre gestion pour booster l\'engagement de vos clients.',
    category: 'profession'
  },
  {
    slug: 'facturation-consultant-seo',
    title: 'Logiciel de Facturation pour Consultants SEO',
    description: 'Gérez vos audits et suivis mensuels SEO. Un outil pro pour les experts du référencement.',
    heroTitle: 'Optimisez votre facturation comme votre SEO',
    heroSubtitle: 'Suivez vos performances financières avec la même précision que vos rankings.',
    category: 'profession'
  },
  {
    slug: 'facturation-assistant-virtuel',
    title: 'Logiciel de Facturation pour Assistants Virtuels',
    description: 'Gérez vos heures de délégation et vos factures clients simplement. L\'outil idéal pour les VA.',
    heroTitle: 'L\'assistant de votre propre gestion',
    heroSubtitle: 'Simplifiez votre facturation pour mieux aider vos clients.',
    category: 'profession'
  },
  {
    slug: 'facturation-evenementiel',
    title: 'Logiciel de Facturation pour Agences Événementielles',
    description: 'Gérez vos budgets d\'événements, acomptes et factures finales. Un outil robuste pour les organisateurs.',
    heroTitle: 'Facturez vos événements sans stress',
    heroSubtitle: 'De la planification au paiement, gérez tout avec Facty.',
    category: 'profession'
  },
  {
    slug: 'facturation-traiteur',
    title: 'Logiciel de Facturation pour Traiteurs',
    description: 'Gérez vos devis de réception et factures de services. Idéal pour les traiteurs indépendants et organisateurs de banquets.',
    heroTitle: 'La facturation aux petits oignons',
    heroSubtitle: 'Présentez des devis appétissants et des factures claires.',
    category: 'profession'
  },
  {
    slug: 'facturation-fleuriste',
    title: 'Logiciel de Facturation pour Fleuristes',
    description: 'Gérez vos compositions et livraisons. Un outil simple pour les boutiques de fleurs et décorateurs floraux.',
    heroTitle: 'Faites fleurir votre entreprise',
    heroSubtitle: 'Une gestion administrative simple et colorée.',
    category: 'profession'
  },
  {
    slug: 'facturation-paysagiste',
    title: 'Logiciel de Facturation pour Paysagistes et Jardiniers',
    description: 'Gérez vos contrats d\'entretien et créations de jardins. Facturation sur le terrain simplifiée.',
    heroTitle: 'Cultivez votre rentabilité',
    heroSubtitle: 'L\'outil indispensable pour les professionnels du paysage.',
    category: 'profession'
  },
  {
    slug: 'facturation-mecanicien',
    title: 'Logiciel de Facturation pour Mécaniciens et Garages',
    description: 'Gérez vos ordres de réparation et factures de pièces. Un outil efficace pour les petits garages.',
    heroTitle: 'Mettez votre gestion sur les chapeaux de roues',
    heroSubtitle: 'Facturez vos réparations en un clin d\'œil.',
    category: 'profession'
  },
  {
    slug: 'facturation-auto-ecole',
    title: 'Logiciel de Facturation pour Auto-Écoles',
    description: 'Gérez vos leçons de conduite et forfaits permis. Suivi des paiements élèves simplifié.',
    heroTitle: 'Conduisez votre entreprise vers le succès',
    heroSubtitle: 'Une gestion administrative sans sortie de route.',
    category: 'profession'
  },
  {
    slug: 'facturation-architecte-interieur',
    title: 'Logiciel de Facturation pour Architectes d\'Intérieur',
    description: 'Gérez vos honoraires de conception et suivi de chantier. Un outil esthétique pour les créateurs d\'espaces.',
    heroTitle: 'Structurez votre facturation avec élégance',
    heroSubtitle: 'Des factures qui reflètent votre sens du détail.',
    category: 'profession'
  },
  {
    slug: 'facturation-decorateur',
    title: 'Logiciel de Facturation pour Décorateurs',
    description: 'Gérez vos coachings déco et achats de mobilier. Facturation simple pour les indépendants.',
    heroTitle: 'Décorez votre gestion administrative',
    heroSubtitle: 'Simplifiez vos factures pour libérer votre créativité.',
    category: 'profession'
  },
  {
    slug: 'facturation-expert-comptable',
    title: 'Logiciel de Facturation pour Experts-Comptables',
    description: 'Gérez vos lettres de mission et honoraires. Un outil conforme pour les cabinets comptables.',
    heroTitle: 'La facturation rigoureuse des experts',
    heroSubtitle: 'Gagnez du temps sur votre propre gestion.',
    category: 'profession'
  },
  {
    slug: 'facturation-notaire',
    title: 'Logiciel de Facturation pour Notaires',
    description: 'Gérez vos actes et émoluments simplement. Un outil sécurisé pour les études notariales.',
    heroTitle: 'La facturation authentique pour les notaires',
    heroSubtitle: 'Sécurité et conformité au cœur de votre gestion.',
    category: 'profession'
  },
  {
    slug: 'facturation-veterinaire',
    title: 'Logiciel de Facturation pour Vétérinaires',
    description: 'Gérez vos consultations et ventes de médicaments. Un outil intuitif pour les cliniques vétérinaires.',
    heroTitle: 'Prenez soin de votre gestion comme de vos patients',
    heroSubtitle: 'Une facturation simple pour les amis des bêtes.',
    category: 'profession'
  },
  {
    slug: 'facturation-pharmacie',
    title: 'Logiciel de Facturation pour Pharmacies',
    description: 'Gérez vos factures fournisseurs et ventes hors ordonnance. Un complément à votre logiciel métier.',
    heroTitle: 'La gestion saine pour votre pharmacie',
    heroSubtitle: 'Simplifiez votre administratif au quotidien.',
    category: 'profession'
  },
  {
    slug: 'facturation-opticien',
    title: 'Logiciel de Facturation pour Opticiens',
    description: 'Gérez vos ventes de montures et verres. Facturation claire pour vos clients et mutuelles.',
    heroTitle: 'Une vision claire de votre facturation',
    heroSubtitle: 'Ne perdez plus de vue vos impayés.',
    category: 'profession'
  },
  {
    slug: 'facturation-bijoutier',
    title: 'Logiciel de Facturation pour Bijoutiers et Joailliers',
    description: 'Gérez vos créations et réparations. Un outil précieux pour les artisans bijoutiers.',
    heroTitle: 'Éclat et précision dans votre facturation',
    heroSubtitle: 'Gérez vos métaux et pierres avec rigueur.',
    category: 'profession'
  },
  {
    slug: 'facturation-imprimeur',
    title: 'Logiciel de Facturation pour Imprimeurs',
    description: 'Gérez vos tirages et commandes personnalisées. Facturation rapide pour les imprimeries.',
    heroTitle: 'Imprimez vos factures en un clic',
    heroSubtitle: 'Une gestion fluide pour vos travaux d\'impression.',
    category: 'profession'
  },
  // --- QUESTIONS / LONG TAIL (SUITE) ---
  {
    slug: 'logiciel-facture-gratuit-sans-compte',
    title: 'Logiciel de Facture Gratuit sans Inscription',
    description: 'Besoin d\'une facture rapide ? Utilisez notre outil sans créer de compte. Téléchargement PDF immédiat.',
    heroTitle: 'Créez votre facture sans attendre',
    heroSubtitle: 'Pas d\'inscription, pas de perte de temps. Juste votre facture.',
    category: 'general'
  },
  {
    slug: 'modele-facture-auto-entrepreneur-gratuit',
    title: 'Modèle de Facture Auto-Entrepreneur Gratuit (PDF/Excel)',
    description: 'Téléchargez nos templates conformes pour micro-entreprise. Inclus : mentions exonération TVA.',
    heroTitle: 'Vos modèles de factures prêts à l\'emploi',
    heroSubtitle: 'Utilisez nos templates ou passez à la vitesse supérieure avec Facty.',
    category: 'general'
  },
  {
    slug: 'difference-devis-facture',
    title: 'Quelle est la différence entre un devis et une facture ?',
    description: 'Comprendre les étapes juridiques de la vente. Du devis engageant à la facture libératoire.',
    heroTitle: 'Devis vs Facture : le guide complet',
    heroSubtitle: 'Apprenez à utiliser chaque document au bon moment.',
    category: 'general'
  },
  {
    slug: 'facture-proforma-definition',
    title: 'Qu\'est-ce qu\'une facture proforma ? Définition et usage',
    description: 'Tout savoir sur la facture proforma : utilité pour les douanes, les banques et les acomptes.',
    heroTitle: 'Maîtrisez la facture proforma',
    heroSubtitle: 'Un outil indispensable pour vos échanges commerciaux.',
    category: 'general'
  },
  {
    slug: 'numerotation-facture-regles',
    title: 'Règles de numérotation des factures : Guide 2026',
    description: 'Évitez les erreurs de numérotation. Séquence chronologique, préfixes et obligations légales.',
    heroTitle: 'Numérotez vos factures sans erreur',
    heroSubtitle: 'Suivez les règles pour une comptabilité irréprochable.',
    category: 'general'
  },
  {
    slug: 'facture-acompte-fonctionnement',
    title: 'Comment faire une facture d\'acompte ?',
    description: 'Sécurisez vos prestations avec des acomptes. Guide de création et de déduction sur la facture finale.',
    heroTitle: 'Gérez vos acomptes sereinement',
    heroSubtitle: 'Améliorez votre trésorerie dès le début de vos missions.',
    category: 'general'
  },
  {
    slug: 'tva-facturation-international',
    title: 'Facturation internationale et TVA : ce qu\'il faut savoir',
    description: 'Comment facturer un client à l\'étranger ? Autoliquidation, exportations et mentions spécifiques.',
    heroTitle: 'Facturez à l\'international sans fautes',
    heroSubtitle: 'Maîtrisez les règles de TVA pour vos clients hors frontières.',
    category: 'general'
  },
  {
    slug: 'delai-conservation-factures',
    title: 'Quel est le délai de conservation des factures ?',
    description: 'Combien de temps garder vos documents comptables ? Obligations pour les entreprises et indépendants.',
    heroTitle: 'Archivez vos factures intelligemment',
    heroSubtitle: 'Respectez les délais légaux de conservation.',
    category: 'general'
  },
  {
    slug: 'logiciel-facturation-open-source',
    title: 'Meilleur Logiciel de Facturation Open Source vs SaaS',
    description: 'Comparatif des solutions de facturation. Pourquoi choisir Facty plutôt qu\'un outil auto-hébergé ?',
    heroTitle: 'Choisissez le bon outil pour votre gestion',
    heroSubtitle: 'Simplicité, sécurité et support : les avantages du SaaS.',
    category: 'general'
  },
  {
    slug: 'facturation-en-ligne-securite',
    title: 'La sécurité de vos données de facturation en ligne',
    description: 'Comment Facty protège vos données financières. Chiffrement, sauvegardes et conformité RGPD.',
    heroTitle: 'Vos factures sont en sécurité avec nous',
    heroSubtitle: 'La protection de vos données est notre priorité absolue.',
    category: 'general'
  },
  // --- GÉO (SUITE) ---
  {
    slug: 'logiciel-facturation-maroc',
    title: 'Logiciel de Facturation au Maroc (Casablanca/Rabat)',
    description: 'Gérez vos factures pro au Maroc. Solution adaptée aux entreprises marocaines à Casablanca et Rabat.',
    heroTitle: 'Simplifiez votre facturation au Maroc',
    heroSubtitle: 'L\'outil moderne pour les entrepreneurs du Royaume.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-tunisie',
    title: 'Logiciel de Facturation en Tunisie (Tunis)',
    description: 'La solution de facturation pour les PME en Tunisie. Créez des factures conformes à Tunis.',
    heroTitle: 'Facturez en toute simplicité en Tunisie',
    heroSubtitle: 'Gagnez en efficacité avec Facty en Tunisie.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-algerie',
    title: 'Logiciel de Facturation en Algérie (Alger)',
    description: 'Gérez vos factures pro en Algérie. Solution rapide pour les entrepreneurs à Alger.',
    heroTitle: 'La facturation moderne en Algérie',
    heroSubtitle: 'Simplifiez votre gestion administrative en Algérie.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-djibouti',
    title: 'Logiciel de Facturation à Djibouti',
    description: 'Simplifiez la gestion de vos factures à Djibouti. Idéal pour les prestataires et commerçants.',
    heroTitle: 'Facturez comme un pro à Djibouti',
    heroSubtitle: 'L\'outil de gestion indispensable à Djibouti.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-comores',
    title: 'Logiciel de Facturation aux Comores',
    description: 'La solution de facturation pour les entreprises aux Comores. Gérez vos factures simplement.',
    heroTitle: 'Simplifiez votre gestion aux Comores',
    heroSubtitle: 'Facty accompagne les entrepreneurs comoriens.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-france',
    title: 'Logiciel de Facturation en France (Freelance & PME)',
    description: 'Solution de facturation conforme pour les entreprises françaises. Devis, factures et suivi de TVA.',
    heroTitle: 'La facturation simple et conforme en France',
    heroSubtitle: 'Gagnez du temps sur votre administratif français.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-belgique',
    title: 'Logiciel de Facturation en Belgique',
    description: 'Gérez vos factures pro en Belgique. Solution adaptée pour les indépendants et PME belges.',
    heroTitle: 'Simplifiez votre gestion en Belgique',
    heroSubtitle: 'Facturez en toute sérénité avec Facty.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-suisse',
    title: 'Logiciel de Facturation en Suisse',
    description: 'La solution de facturation pour les entreprises suisses. Gérez vos factures en CHF simplement.',
    heroTitle: 'Facturez avec précision en Suisse',
    heroSubtitle: 'L\'outil moderne pour les entrepreneurs helvètes.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-luxembourg',
    title: 'Logiciel de Facturation au Luxembourg',
    description: 'Gérez vos factures pro au Luxembourg. Solution rapide pour les PME luxembourgeoises.',
    heroTitle: 'La facturation efficace au Luxembourg',
    heroSubtitle: 'Simplifiez votre administratif au Grand-Duché.',
    category: 'geo'
  },
  {
    slug: 'logiciel-facturation-canada-quebec',
    title: 'Logiciel de Facturation au Québec (Canada)',
    description: 'Solution de facturation pour les entrepreneurs québécois. Gestion des taxes (TPS/TVQ) simplifiée.',
    heroTitle: 'Facturez en toute simplicité au Québec',
    heroSubtitle: 'L\'outil de gestion préféré des Québécois.',
    category: 'geo'
  },
  // --- FONCTIONNALITÉS (SUITE) ---
  {
    slug: 'facturation-multi-devises',
    title: 'Logiciel de Facturation Multi-Devises',
    description: 'Facturez vos clients dans n\'importe quelle devise. Facty gère les taux de change pour vous.',
    heroTitle: 'Facturez le monde entier',
    heroSubtitle: 'Gérez vos transactions internationales sans prise de tête.',
    category: 'feature'
  },
  {
    slug: 'export-comptable-facile',
    title: 'Export Comptable Facile (CSV/Excel)',
    description: 'Simplifiez la vie de votre comptable. Exportez toutes vos données de facturation en un clic.',
    heroTitle: 'Votre comptabilité prête en un clic',
    heroSubtitle: 'Gagnez du temps lors de vos clôtures mensuelles.',
    category: 'feature'
  },
  {
    slug: 'personnalisation-facture-logo',
    title: 'Personnalisation de Facture avec votre Logo',
    description: 'Créez des factures à l\'image de votre marque. Ajoutez votre logo, vos couleurs et vos polices.',
    heroTitle: 'Des factures qui vous ressemblent',
    heroSubtitle: 'Renforcez votre image de marque avec des documents pro.',
    category: 'feature'
  },
  {
    slug: 'gestion-catalogue-produits',
    title: 'Gestion de Catalogue Produits et Services',
    description: 'Gagnez du temps en enregistrant vos prestations. Insérez vos articles en un clic dans vos factures.',
    heroTitle: 'Gérez vos services intelligemment',
    heroSubtitle: 'Un catalogue organisé pour une facturation plus rapide.',
    category: 'feature'
  },
  {
    slug: 'statistiques-ventes-dashboard',
    title: 'Tableau de Bord et Statistiques de Ventes',
    description: 'Visualisez la croissance de votre entreprise. Graphiques clairs et indicateurs clés de performance.',
    heroTitle: 'Pilotez votre activité avec précision',
    heroSubtitle: 'Prenez les meilleures décisions grâce à vos données.',
    category: 'feature'
  },
  {
    slug: 'facturation-mobile-app',
    title: 'Application de Facturation Mobile (iOS & Android)',
    description: 'Facturez où que vous soyez. Une interface optimisée pour smartphone et tablette.',
    heroTitle: 'Votre entreprise dans votre poche',
    heroSubtitle: 'Créez et envoyez vos factures même en déplacement.',
    category: 'feature'
  },
  {
    slug: 'signature-electronique-devis',
    title: 'Signature Électronique des Devis en Ligne',
    description: 'Faites signer vos devis plus vite. Une solution légale et rapide pour valider vos contrats.',
    heroTitle: 'Validez vos projets instantanément',
    heroSubtitle: 'Réduisez les délais de signature avec le digital.',
    category: 'feature'
  },
  {
    slug: 'facturation-collaborative-equipe',
    title: 'Facturation Collaborative en Équipe',
    description: 'Travaillez à plusieurs sur votre gestion. Gérez les accès et les rôles de vos collaborateurs.',
    heroTitle: 'Gérez votre facturation à plusieurs',
    heroSubtitle: 'Un outil pensé pour le travail en équipe.',
    category: 'feature'
  },
  {
    slug: 'api-facturation-developpeurs',
    title: 'API de Facturation pour Développeurs',
    description: 'Intégrez Facty à vos propres outils. Une API robuste pour automatiser vos flux.',
    heroTitle: 'Connectez Facty à votre écosystème',
    heroSubtitle: 'L\'outil de facturation programmable pour les techs.',
    category: 'feature'
  },
  {
    slug: 'support-client-prioritaire',
    title: 'Support Client Réactif et Prioritaire',
    description: 'Une équipe à votre écoute pour vous aider. Réponse rapide et accompagnement personnalisé.',
    heroTitle: 'Nous sommes là pour vous aider',
    heroSubtitle: 'Un support humain pour une gestion sereine.',
    category: 'feature'
  }
];

// On peut générer dynamiquement le reste pour atteindre 100 si besoin, 
// mais commençons par ces 30+ ultra-qualitatives.
// Pour atteindre 100, on peut décliner les métiers par pays :
// "Logiciel facturation architecte Togo", "Logiciel facturation avocat Sénégal", etc.
