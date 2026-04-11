import { motion } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface PWAInstallButtonProps {
  isMobileOverlay?: boolean;
}

export default function PWAInstallButton({ isMobileOverlay }: PWAInstallButtonProps) {
  const { canInstall, install, isInstalled } = usePWAInstall();

  if (!canInstall || isInstalled) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={install}
      className={`flex items-center ${isMobileOverlay ? 'justify-start' : 'justify-center lg:justify-start'} gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition-all duration-150 border border-indigo-500/30 mb-2`}
    >
      <span className="flex-shrink-0"><DownloadIcon /></span>
      <span className={`${isMobileOverlay ? 'inline' : 'hidden lg:inline'} truncate`}>Installer l'app</span>
    </motion.button>
  );
}
