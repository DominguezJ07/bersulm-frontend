import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Gift, ChevronDown, Search, User as UserIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui'
import { loyaltyService } from '@/services/loyalty.service'
import type { LoyaltyCard, User } from '@/types'
import { ROUTES } from '@/constants/routes'

const benefits = [
  { title: 'Acumula Visitas', desc: 'Cada visita te acerca a una recompensa' },
  { title: 'Gana Recompensas', desc: 'Completa 5 visitas y reclama un premio' },
  { title: 'Beneficios VIP', desc: 'Acceso exclusivo a ofertas y promociones' },
]

export default function Loyalty() {
  const { user: authUser, token } = useAuth()
  const navigate = useNavigate()
  const isAdmin = Boolean(authUser?.role === 'admin' || (authUser as { isAdmin?: boolean })?.isAdmin)

  const [isFlipped, setIsFlipped] = useState(false)
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userCard, setUserCard] = useState<LoyaltyCard | null>(null)
  const [userCardLoading, setUserCardLoading] = useState(false)
  const [isAddingVisit, setIsAddingVisit] = useState(false)

  const visitsCompleted = card?.visits ?? 0
  const isRewardPending = card?.status === 'reward_pending'
  const isRewardClaimed = card?.status === 'reward_claimed'
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    if (isAdmin) {
      setIsLoading(false)
      searchInputRef.current?.focus()
      return
    }

    const loadCard = async () => {
      try {
        const response = await loyaltyService.getCard()
        const raw = response as unknown as Record<string, unknown> | null
        const data = raw?.data ?? response
        setCard((data as LoyaltyCard) ?? null)
      } catch {
        toast.error('No se pudo cargar tu tarjeta de fidelidad')
      } finally {
        setIsLoading(false)
      }
    }

    loadCard()
  }, [token, isAdmin])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await loyaltyService.searchUsers(query)
      const raw = response as unknown as Record<string, unknown> | null
      const data = raw?.data ?? response
      setSearchResults((data as User[]) || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      const trimmed = value.trim()

      if (!trimmed) {
        setSearchResults([])
        return
      }

      debounceRef.current = setTimeout(() => {
        performSearch(trimmed)
      }, 250)
    },
    [],
  )

  const handleSearchFocus = () => {
    if (!searchQuery.trim() && searchResults.length === 0 && !isSearching) {
      performSearch('')
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    searchInputRef.current?.focus()
  }

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user)
    setUserCard(null)
    setUserCardLoading(true)
    try {
      const response = await loyaltyService.getUserCard(user._id || user.id || '')
      const raw = response as unknown as Record<string, unknown> | null
      const data = raw?.data ?? response
      setUserCard((data as LoyaltyCard) ?? null)
    } catch {
      setUserCard(null)
      toast.error('Error al obtener la tarjeta del usuario')
    } finally {
      setUserCardLoading(false)
    }
  }

  const handleAddVisit = async () => {
    if (!selectedUser || isAddingVisit) return
    setIsAddingVisit(true)
    try {
      await loyaltyService.addVisit(selectedUser._id || selectedUser.id || '')
      toast.success('Visita agregada correctamente')
      handleDeselectUser()
    } catch {
      toast.error('Error al agregar la visita')
    } finally {
      setIsAddingVisit(false)
    }
  }

  const handleDeselectUser = () => {
    setSelectedUser(null)
    setUserCard(null)
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-8 sm:px-8 lg:px-10">
        <Card className="p-8 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            Inicia sesión para ver tu tarjeta de fidelidad
          </p>
        </Card>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-8 sm:px-8 lg:px-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
      </main>
    )
  }

  const displayName = authUser?.name || 'Miembro BERSULM'

  if (isAdmin) {
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
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="Buscar usuario por nombre, email o teléfono..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 pl-12 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
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
                      onClick={() => handleSelectUser(user)}
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
                onClick={handleDeselectUser}
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
                  onClick={handleAddVisit}
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

  return (
    <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes flip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
        .card-3d { perspective: 1000px; cursor: pointer; width: 100%; margin: 0 auto; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Programa de Fidelidad</p>
        <h1 className="mx-auto text-3xl font-semibold sm:text-4xl">
          Tu Tarjeta Premium BERSULM
        </h1>
      </header>

      {card && (
        <>
          <div className="my-8 flex justify-center">
            <div className="w-[92%] max-w-[420px]">
              <div className="relative" style={{ perspective: '1000px' }}>
                <div className="card-3d h-[240px] md:h-[260px]" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                    <div className="card-face">
                      <Card className="flex h-full flex-col justify-between rounded-[24px] border border-gold/25 bg-[var(--bg-primary)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)] ring-1 ring-gold/15 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-bold uppercase tracking-[0.25em] text-gold sm:text-[26px]">
                              BERSULM
                            </h2>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-gold/70">
                              TARJETA PREMIUM
                            </p>
                          </div>
                          <div className="text-gold/90">
                            <Award size={20} />
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                          <p className="text-base font-bold uppercase tracking-[0.15em] text-[var(--text-primary)]">
                            {displayName}
                          </p>
                        </div>

                        <div className="space-y-2 text-center text-[var(--text-secondary)]">
                          <p className="text-[11px] tracking-[0.2em] text-[var(--text-muted)]">**** **** **** 2026</p>
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-gold/80">
                            <span className="font-semibold text-gold">BERSULM VIP</span>
                            <span className="text-[var(--text-muted)]">Toca para girar</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="card-face card-back">
                      <Card className="flex h-full flex-col justify-between rounded-[28px] border border-gold/25 bg-[var(--bg-primary)] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.28)] ring-1 ring-gold/15 md:p-6">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">Tarjeta de fidelidad</p>
                          <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Progreso</h3>
                          <p className="text-xs text-gold/90">{Math.min(visitsCompleted, 5)} de 5 visitas completadas</p>
                        </div>

                        <div className="grid gap-2 pb-2 md:gap-3">
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const isStamped = i < Math.min(visitsCompleted, 5)
                              return (
                                <div
                                  key={i}
                                  className={`aspect-square rounded-3xl border border-[var(--border-color)] p-2 text-center transition ${
                                    isStamped
                                      ? 'bg-gold text-surface-dark shadow-[inset_0_0_0_2px_rgba(0,0,0,0.08)]'
                                      : 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                                  }`}
                                >
                                  <span className="block text-lg font-bold">{i + 1}</span>
                                  <span className="mt-1 block text-[8px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                                    BERSULM
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="space-y-1 text-center text-xs text-[var(--text-secondary)]">
                          <p>Completa 5 visitas para una recompensa.</p>
                          <p>Toca la tarjeta para girarla.</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isRewardPending && (
            <section className="mb-12">
              <div className="mx-auto max-w-md rounded-2xl bg-gradient-to-r from-gold to-[#d4891a] p-6 text-center text-surface-dark shadow-lg shadow-gold/30">
                <Gift size={36} className="mx-auto mb-3" />
                <h2 className="mb-2 text-2xl font-bold">¡Tienes un regalo por tu fidelidad!</h2>
                <p className="mb-5 text-sm opacity-90">
                  Has completado 5 visitas. ¡Juega ahora para descubrir tu premio!
                </p>
                <button
                  onClick={() => navigate(ROUTES.LOYALTY_MINIGAME)}
                  className="rounded-xl bg-surface-dark px-8 py-3 text-base font-bold text-gold shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  JUGAR AHORA
                </button>
              </div>
            </section>
          )}

          {isRewardClaimed && card.rewardWon && (
            <section className="mb-12">
              <div className="mx-auto max-w-md rounded-2xl border border-gold/30 bg-[var(--bg-card)] p-6 text-center shadow-lg">
                <Award size={36} className="mx-auto mb-3 text-gold" />
                <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
                  Premio Reclamado
                </h2>
                <p className="mb-1 text-lg font-semibold text-gold">
                  {card.rewardWon}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  ¡Disfruta tu premio en tu próxima visita!
                </p>
                {card.currentCycle > 0 && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Ciclo actual: {card.currentCycle}
                  </p>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {!card && (
        <div className="my-12 text-center">
          <Card className="mx-auto max-w-md border border-gold/20 p-8">
            <Award size={40} className="mx-auto mb-4 text-gold" />
            <p className="text-lg text-[var(--text-secondary)]">
              Aún no tienes una tarjeta de fidelidad. Agenda tu primera cita para empezar.
            </p>
          </Card>
        </div>
      )}

      <section>
        <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">
          Beneficios del Programa
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Card
              key={i}
              className="border border-gold/20 bg-[var(--bg-card)] p-6 text-center transition-all hover:shadow-lg hover:shadow-gold/20"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-surface-dark">
                  <Gift size={24} />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">{benefit.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
