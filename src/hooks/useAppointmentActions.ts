import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsService } from '@/services/appointments.service'

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  return {
    cancelAppointment: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  }
}
