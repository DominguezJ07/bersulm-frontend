import { useState, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { rewardsService } from '@/services/rewards.service'
import type { Raffle } from '@/types'

const LIST_LIMIT = 20

interface UsePrizeAdminProps {
  onSuccess?: () => void
}

export function usePrizeAdmin({ onSuccess }: UsePrizeAdminProps = {}) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data,
    isLoading: isLoadingRaffles,
    refetch: refetchRaffles,
  } = useQuery({
    queryKey: ['raffles-admin', page],
    queryFn: async () => {
      const res = await rewardsService.getAllRaffles(page, LIST_LIMIT)
      return res.data as { raffles: Raffle[]; total: number; totalPages: number }
    },
    staleTime: 30 * 1000,
  })

  const raffles = data?.raffles ?? []
  const totalPages = data?.totalPages ?? 1

  const hasActiveRaffle = useMemo(
    () => raffles.some((r) => r.status !== 'completed'),
    [raffles]
  )

  const invalidateRaffleQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['raffles-admin'] })
    queryClient.invalidateQueries({ queryKey: ['raffle-history'] })
    queryClient.invalidateQueries({ queryKey: ['raffle-current-admin'] })
  }, [queryClient])

  const openCreate = useCallback(() => {
    if (hasActiveRaffle) {
      toast('Ya hay un sorteo activo. Debe finalizar antes de crear uno nuevo.', {
        icon: 'ℹ️',
      })
      return
    }
    setEditingRaffle(null)
    setIsModalOpen(true)
  }, [hasActiveRaffle])

  const openEdit = useCallback((raffle: Raffle) => {
    setEditingRaffle(raffle)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingRaffle(null)
  }, [])

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setIsSubmitting(true)
      try {
        if (editingRaffle) {
          await rewardsService.updatePrize(editingRaffle._id, formData)
          toast.success('Premio actualizado correctamente')
        } else {
          await rewardsService.createPrize(formData)
          toast.success('Premio del mes creado correctamente')
        }
        invalidateRaffleQueries()
        onSuccess?.()
        closeModal()
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Error al guardar el premio'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingRaffle, invalidateRaffleQueries, closeModal, onSuccess]
  )

  const handleDelete = useCallback(
    async (raffleId: string) => {
      const raffle = raffles.find((r) => r._id === raffleId)
      const confirmMessage = raffle
        ? `¿Eliminar el sorteo "${raffle.prize?.name || raffle.month}"? Esta acción no se puede deshacer.`
        : '¿Eliminar este sorteo? Esta acción no se puede deshacer.'

      if (!window.confirm(confirmMessage)) return

      try {
        await rewardsService.deleteRaffle(raffleId)
        invalidateRaffleQueries()
        onSuccess?.()
        toast.success('Sorteo eliminado correctamente')
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Error al eliminar el sorteo'
        toast.error(msg)
      }
    },
    [raffles, invalidateRaffleQueries, onSuccess]
  )

  return {
    raffles,
    isLoadingRaffles,
    totalPages,
    page,
    setPage,
    refetchRaffles,
    hasActiveRaffle,
    isModalOpen,
    isSubmitting,
    editingRaffle,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
  }
}
