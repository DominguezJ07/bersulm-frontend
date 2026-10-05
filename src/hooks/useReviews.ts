import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '@/services/reviews.service'

export function useApprovedReviews(limit?: number) {
  return useQuery({
    queryKey: ['reviews', 'approved', { limit }],
    queryFn: () => reviewsService.getApproved({ limit }),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: reviewsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })

  return {
    createReview: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  }
}
