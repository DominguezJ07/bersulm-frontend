import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuth } from './useAuth'

export function useAuthProfile() {
  const { updateUser } = useAuth()

  const avatarMutation = useMutation({
    mutationFn: (file: File) => authService.updateAvatar(file),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
      }
    },
  })

  const profileMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string }) =>
      authService.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
      }
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  })

  return {
    updateAvatar: avatarMutation.mutateAsync,
    isUpdatingAvatar: avatarMutation.isPending,
    updateProfile: profileMutation.mutateAsync,
    isUpdatingProfile: profileMutation.isPending,
    changePassword: passwordMutation.mutateAsync,
    isChangingPassword: passwordMutation.isPending,
  }
}
