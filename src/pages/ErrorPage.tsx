import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, FileQuestion, ServerCrash, Ban, Clock, FileWarning, AlertCircle } from 'lucide-react';

interface ErrorConfig {
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
}

const errorConfigs: Record<string, ErrorConfig> = {
  '400': {
    title: 'Bad Request',
    message: "La requête n'a pas pu être traitée. Veuillez vérifier les informations fournies.",
    icon: FileWarning,
    color: 'text-orange-500',
  },
  '401': {
    title: 'Unauthorized',
    message: "Vous devez être connecté pour accéder à cette page. Votre session a peut-être expiré.",
    icon: ShieldAlert,
    color: 'text-red-500',
  },
  '403': {
    title: 'Forbidden',
    message: "Accès refusé. Vous n'avez pas les permissions nécessaires pour consulter cette page.",
    icon: Ban,
    color: 'text-red-600',
  },
  '404': {
    title: 'Not Found',
    message: "La page ou la ressource que vous recherchez est introuvable.",
    icon: FileQuestion,
    color: 'text-slate-500',
  },
  '406': {
    title: 'Not Acceptable',
    message: "Le format de la demande n'est pas pris en charge.",
    icon: AlertCircle,
    color: 'text-yellow-500',
  },
  '409': {
    title: 'Conflict',
    message: "Un conflit est survenu avec les données existantes (par exemple, une information déjà utilisée).",
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
  '429': {
    title: 'Too Many Requests',
    message: "Vous avez effectué trop de requêtes. Veuillez patienter quelques instants avant de réessayer.",
    icon: Clock,
    color: 'text-blue-500',
  },
  '500': {
    title: 'Internal Server Error',
    message: "Une erreur inattendue est survenue sur nos serveurs. Notre équipe technique a été notifiée.",
    icon: ServerCrash,
    color: 'text-red-600',
  },
};

export default function ErrorPage({ defaultCode }: { defaultCode?: string }) {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const errorCode = code || defaultCode || '404';
  const config = errorConfigs[errorCode] || errorConfigs['404'];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${config.color}`}>
          <Icon size={40} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-6xl font-bold text-slate-900 mb-2">{errorCode}</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{config.title}</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          {config.message}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Retourner à la page précédente
          </button>
          <Link
            to="/"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-sm font-medium">
        facty.logonova.site
      </div>
    </div>
  );
}
