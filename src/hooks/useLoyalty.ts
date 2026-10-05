import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { loyaltyService } from '@/services/loyalty.service'
import type { LoyaltyCard } from '@/types'

export function useLoyaltyCard() {
  const { user } = useAuth()
  const userId = user?._id

  return useQuery<LoyaltyCard | null>({
    queryKey: ['loyalty', 'card', userId],
    queryFn: async () => {
      const response = await loyaltyService.getCard()
      const raw = response as unknown as Record<string, unknown> | null
      const data = raw?.data ?? response
      return (data as LoyaltyCard) ?? null
    },
    enabled: Boolean(userId),
  })
}

export function useUseReward() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?._id

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await loyaltyService.useReward(rewardId)
      const raw = response as unknown as Record<string, unknown> | null
      return (raw?.data as LoyaltyCard) ?? response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'card', userId] })
    },
  })
}

export function useMinigame() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?._id

  const minigameQuery = useQuery({
    queryKey: ['loyalty', 'minigame', userId],
    queryFn: async () => {
      const response = await loyaltyService.getMinigame()
      return response.data
    },
    enabled: Boolean(userId),
  })

  const revealMutation = useMutation({
    mutationFn: async (cardIndex: number) => {
      const response = await loyaltyService.revealCard(cardIndex)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'card', userId] })
    },
  })

  return {
    minigame: minigameQuery.data ?? null,
    isLoading: minigameQuery.isLoading,
    error: minigameQuery.error,
    revealCard: revealMutation.mutateAsync,
    isRevealing: revealMutation.isPending,
  }
}
