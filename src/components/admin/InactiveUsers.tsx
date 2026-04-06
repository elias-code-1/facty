import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Clock, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { InactiveUser } from '../../hooks/useAdminStats';

interface InactiveUsersProps {
  users: InactiveUser[];
}

type FilterType = 7 | 30 | 90;

/** Composant pour afficher les utilisateurs inactifs */
export default function InactiveUsers({ users }: InactiveUsersProps) {
  const [filter, setFilter] = useState<FilterType>(7);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.daysSinceLastSeen >= filter);
  }, [users, filter]);

  const counts = useMemo(() => ({
    '7': users.filter(u => u.daysSinceLastSeen >= 7).length,
    '30': users.filter(u => u.daysSinceLastSeen >= 30).length,
    '90': users.filter(u => u.daysSinceLastSeen >= 90).length
  }), [users]);

  if (users.length === 0) {
    return (
      <div className="bg-green-50 p-12 rounded-2xl border border-green-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-green-800">Félicitations !</h3>
        <p className="text-green-600">Tous vos utilisateurs sont actifs sur la plateforme.</p>
      </div>
    );
  }

  const getSeverityColor = (days: number) => {
    if (days >= 90) return 'text-red-700 font-semibold';
    if (days >= 30) return 'text-red-500';
    return 'text-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-50 rounded-xl w-fit">
        {([7, 30, 90] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              filter === f 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f}+ jours
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === f ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
            }`}>
              {counts[f.toString() as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length > 0 ? (
            filteredUsers.slice(0, 10).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span className={`text-xs font-medium ${getSeverityColor(user.daysSinceLastSeen)}`}>
                        Inactif depuis {user.daysSinceLastSeen} jours
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <FileText size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {user.invoiceCount} factures créées
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/invoxa/users/${user.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">Aucun utilisateur ne correspond à ce critère d'inactivité</p>
            </div>
          )}
        </AnimatePresence>
        
        {filteredUsers.length > 10 && (
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            + {filteredUsers.length - 10} autres utilisateurs inactifs
          </p>
        )}
      </div>
    </div>
  );
}
