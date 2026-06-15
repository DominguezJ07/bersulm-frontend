import { Search, User as UserIcon, X, ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui'
import type { LoyaltyCard, User } from '@/types'

interface AdminLoyaltyPanelProps {
  searchQuery: string
  searchResults: User[]
  isSearching: boolean
  selectedUser: User | null
  userCard: LoyaltyCard | null
  userCardLoading: boolean
  isAddingVisit: boolean
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onClearSearch: () => void
  onSelectUser: (user: User) => void
  onDeselectUser: () => void
  onAddVisit: () => void
}

export function AdminLoyaltyPanel({
  searchQuery,
  searchResults,
  isSearching,
  selectedUser,
  userCard,
  userCardLoading,
  isAddingVisit,
  searchInputRef,
  onSearchChange,
  onSearchFocus,
  onClearSearch,
  onSelectUser,
  onDeselectUser,
  onAddVisit,
}: AdminLoyaltyPanelProps) {
  return (
    <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Panel Admin</p>
        <h1 className="mx-auto text-3xl font-semibold sm:text-4xl">
          Fidelidad de Usuarios
        </h1>
      </header>

      <div className="mx-auto mb-4 max-w-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            placeholder="Buscar usuario por nombre, email o teléfono..."
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 pl-12 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-gold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-gold border-gray-500" />
            </div>
          )}
        </div>
      </div>

      {!selectedUser && (
        <section className="mx-auto mb-6 max-w-2xl">
          {searchQuery.trim() && !isSearching && searchResults.length > 0 && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Resultados ({searchResults.length})
              </p>
            </div>
          )}

          {!searchQuery.trim() && !isSearching && searchResults.length === 0 && (
            <div className="py-12 text-center">
              <Search size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">
                Haz clic en el buscador para ver todos los usuarios
              </p>
            </div>
          )}

          {isSearching && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-gold border-gray-600" />
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {searchResults.map((user) => (
                <Card
                  key={user._id || user.id}
                  className="flex items-center justify-between border border-[var(--border-color)] bg-[var(--bg-card)] p-4 transition-all hover:border-gold/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {user.email}{user.phone ? ` · ${user.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectUser(user)}
                    className="rounded-lg border border-gold/40 px-4 py-1.5 text-xs font-semibold text-gold transition-all hover:border-gold hover:bg-gold/10"
                  >
                    Ver Tarjeta
                  </button>
                </Card>
              ))}
            </div>
          )}

          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              No se encontraron usuarios con &quot;{searchQuery.trim()}&quot;
            </p>
          )}
        </section>
      )}

      {selectedUser && (
        <section className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Tarjeta de {selectedUser.name}
            </p>
            <button
              onClick={onDeselectUser}
              className="text-xs text-[var(--text-muted)] underline hover:text-gold"
            >
              Cerrar
            </button>
          </div>

          {userCardLoading && (
            <Card className="flex items-center justify-center border border-gold/20 bg-[var(--bg-card)] p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-gold border-gray-600" />
            </Card>
          )}

          {!userCardLoading && userCard && (
            <Card className="border border-gold/20 bg-[var(--bg-card)] p-6">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isStamped = i < Math.min(userCard.visits, 5)
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-2xl border p-2 text-center transition ${
                        isStamped
                          ? 'border-gold bg-gold text-surface-dark shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
                      }`}
                    >
                      <span className="block text-lg font-bold">{i + 1}</span>
                      <span className="mt-0.5 block text-[7px] uppercase tracking-[0.2em]">
                        BERSULM
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Visitas</span>
                  <p className="font-semibold">{Math.min(userCard.visits, 5)}/5</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Ciclo</span>
                  <p className="font-semibold">{userCard.currentCycle}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Total visitas</span>
                  <p className="font-semibold">{userCard.totalVisits}</p>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Estado</span>
                  <p className={`font-semibold ${
                    userCard.status === 'reward_pending'
                      ? 'text-gold'
                      : userCard.status === 'reward_claimed'
                        ? 'text-green-400'
                        : ''
                  }`}>
                    {userCard.status === 'active'
                      ? 'Activo'
                      : userCard.status === 'reward_pending'
                        ? 'Premio pendiente'
                        : 'Premio reclamado'}
                  </p>
                </div>
              </div>

              {userCard.rewardWon && (
                <div className="mt-4 rounded-lg bg-gold/10 px-4 py-2 text-sm">
                  <span className="text-[var(--text-muted)]">Último premio: </span>
                  <span className="font-semibold text-gold">{userCard.rewardWon}</span>
                </div>
              )}

              <button
                onClick={onAddVisit}
                disabled={isAddingVisit}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-surface-dark transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingVisit ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-surface-dark border-gold/30" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="rotate-180" />
                    Agregar Visita +1
                  </>
                )}
              </button>
            </Card>
          )}

          {!userCardLoading && !userCard && (
            <Card className="border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center">
              <UserIcon size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                Este usuario no tiene tarjeta de fidelidad
              </p>
            </Card>
          )}
        </section>
      )}
    </main>
  )
}
