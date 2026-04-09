import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ErrorViewer from '../ui/ErrorViewer';

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Fermer le menu à chaque changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar Desktop/Tablet */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 no-print transition-all duration-300 w-20 lg:w-64">
        <AdminSidebar />
      </aside>

      {/* Sidebar Mobile (Always rendered, handles its own visibility) */}
      <AdminSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-20 lg:ml-64 w-full">
        <div className="no-print sticky top-0 z-30">
          <AdminHeader onMenuClick={() => setIsMenuOpen(true)} />
        </div>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
      <ErrorViewer />
    </div>
  );
}
