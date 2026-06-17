import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Reward } from '@/types'

interface RewardFormData {
  name: string
  description: string
  icon: string
  type: 'corte' | 'descuento' | 'bebida' |
        'tratamiento' | 'kit' | 'perfilado'
  isActive: boolean
  isLoyaltyReward: boolean
}

export function useRewardsAdmin() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReward, setEditingReward] =
    useState<Reward | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rewards'] })
    queryClient.invalidateQueries({ queryKey: ['rewards-admin'] })
  }, [queryClient])

  const openCreate = useCallback(() => {
    setEditingReward(null)
    setIsModalOpen(true)
  }, [])

  const openEdit = useCallback((reward: Reward) => {
    setEditingReward(reward)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingReward(null)
  }, [])

  const handleSubmit = useCallback(
    async (data: RewardFormData) => {
      setIsSubmitting(true)
      try {
        if (editingReward) {
          await api.put(
            `/rewards/${editingReward._id || editingReward.id}`,
            data
          )
          toast.success('Premio actualizado correctamente')
        } else {
          await api.post('/rewards', data)
          toast.success('Premio creado correctamente')
        }
        invalidate()
        closeModal()
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message
          || 'Error al guardar el premio'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingReward, invalidate, closeModal]
  )

  const handleToggleActive = useCallback(
    async (reward: Reward) => {
      const id = reward._id || reward.id || ''
      setTogglingId(id)
      try {
        await api.put(`/rewards/${id}`, {
          isActive: !reward.isActive
        })
        const action = reward.isActive ? 'desactivado' : 'activado'
        toast.success(`Premio ${action} correctamente`)
        invalidate()
      } catch {
        toast.error('Error al cambiar el estado del premio')
      } finally {
        setTogglingId(null)
      }
    },
    [invalidate]
  )

  return {
    isModalOpen,
    editingReward,
    isSubmitting,
    togglingId,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleToggleActive,
  }
}
