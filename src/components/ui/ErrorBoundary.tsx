import * as React from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary pour capturer et afficher les erreurs de l'application
 * Permet de copier les détails techniques pour le débogage
 */
class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleCopyError = async () => {
    if (!this.state.error) return;
    
    const errorDetails = {
      message: this.state.error.message,
      stack: this.state.error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      const btn = document.getElementById('copy-error-btn');
      if (btn) {
        const originalContent = btn.innerHTML;
        btn.innerHTML = 'Copié !';
        setTimeout(() => {
          btn.innerHTML = originalContent;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy error details', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
            <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-800">Oups ! Quelque chose a mal tourné.</h1>
              <p className="text-slate-500">
                Une erreur inattendue est survenue. Vous pouvez essayer de rafraîchir la page ou copier les détails de l'erreur pour obtenir de l'aide.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 rounded-xl p-4 text-left overflow-hidden">
                <p className="text-xs font-mono text-red-600 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Rafraîchir la page
              </button>
              
              <button
                id="copy-error-btn"
                onClick={this.handleCopyError}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Copy size={18} />
                Copier les détails de l'erreur
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
