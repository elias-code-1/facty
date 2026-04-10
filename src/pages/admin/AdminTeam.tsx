import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminTeam } from '../../hooks/useAdminTeam'
import { TEAM_ROLES } from '../../data/teamRoles'
import TeamRoleBadge from '../../components/admin/TeamRoleBadge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Toast from '../../components/ui/Toast'

export default function AdminTeam() {
  const {
    members, loading,
    inviteMember, suspendMember,
    reactivateMember, removeMember
  } = useAdminTeam()

  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: ''
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.full_name || !inviteForm.role) {
      setToast({
        message: 'Tous les champs sont requis',
        type: 'error'
      })
      return
    }

    setInviteLoading(true)
    try {
      await inviteMember(inviteForm)
      setShowInvite(false)
      setInviteForm({
        email: '', full_name: '', role: ''
      })
      setToast({
        message: 'Invitation envoyée ✓',
        type: 'success'
      })
    } catch (err: any) {
      setToast({
        message: err.message ?? 'Erreur lors de l invitation',
        type: 'error'
      })
    } finally {
      setInviteLoading(false)
    }
  }

  const activeCount = members.filter(m => m.status === 'active').length
  const pendingCount = members.filter(m => m.status === 'pending').length
  const suspendedCount = members.filter(m => m.status === 'suspended').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Équipe
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {members.length} membres
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-indigo-700 transition"
        >
          + Inviter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Actifs',
            value: activeCount,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            label: 'En attente',
            value: pendingCount,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          },
          {
            label: 'Suspendus',
            value: suspendedCount,
            color: 'text-red-600',
            bg: 'bg-red-50'
          },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Liste membres */}
      {loading ? (
        <div className="text-center text-slate-400 py-12">
          Chargement...
        </div>
      ) : members.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-600 font-medium">
            Aucun membre dans l'équipe
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Invitez des membres pour déléguer des accès
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {members.map((member, i) => (
            <div key={member.id}
              className={`flex items-center gap-3 p-4 ${i < members.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {member.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">
                  {member.full_name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {member.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <TeamRoleBadge role={member.role} size="sm" />
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-600'
                      : member.status === 'pending'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {member.status === 'active' ? '● Actif'
                      : member.status === 'pending' ? '● En attente'
                      : '● Suspendu'
                    }
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {member.status === 'active' && (
                  <button
                    onClick={() =>
                      setConfirmAction({
                        title: 'Suspendre ?',
                        message: `Suspendre ${member.full_name} ? Il ne pourra plus se connecter.`,
                        onConfirm: () => suspendMember(member.id, member.email)
                      })
                    }
                    className="text-xs text-orange-500 hover:text-orange-700"
                  >
                    Suspendre
                  </button>
                )}
                {member.status === 'suspended' && (
                  <button
                    onClick={() => reactivateMember(member.id, member.email)}
                    className="text-xs text-green-500 hover:text-green-700"
                  >
                    Réactiver
                  </button>
                )}
                <button
                  onClick={() =>
                    setConfirmAction({
                      title: 'Retirer ?',
                      message: `Retirer ${member.full_name} de l'équipe ?`,
                      onConfirm: () => removeMember(member.id, member.email)
                    })
                  }
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal invitation */}
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Inviter un membre"
      >
        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Nom complet *
            </label>
            <input
              type="text"
              value={inviteForm.full_name}
              onChange={e => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Jean Dupont"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Email *
            </label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="jean@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Rôle *
            </label>
            <select
              value={inviteForm.role}
              onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Choisir un rôle...</option>
              {Object.entries(TEAM_ROLES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} — {config.description}
                </option>
              ))}
            </select>

            {/* Description du rôle */}
            {inviteForm.role && (
              <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-700">
                {TEAM_ROLES[inviteForm.role as keyof typeof TEAM_ROLES]?.description}
                <br />
                <span className="font-medium mt-1 block">
                  Accès aux pages :
                </span>
                {TEAM_ROLES[inviteForm.role as keyof typeof TEAM_ROLES]?.pages.join(', ')}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowInvite(false)}
              className="flex-1 border border-slate-200 rounded-xl py-3 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleInvite}
              disabled={inviteLoading}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {inviteLoading ? 'Envoi...' : 'Envoyer invitation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            confirmAction.onConfirm()
            setConfirmAction(null)
          }}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmVariant="danger"
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  )
}
