import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { loyaltyService } from '@/services/loyalty.service'
import type { LoyaltyCard, User } from '@/types'

export function useLoyaltyAdmin() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userCard, setUserCard] = useState<LoyaltyCard | null>(null)
  const [userCardLoading, setUserCardLoading] = useState(false)
  const [isAddingVisit, setIsAddingVisit] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const handleDeselectUser = () => {
    setSelectedUser(null)
    setUserCard(null)
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

  return {
    searchQuery,
    searchResults,
    isSearching,
    selectedUser,
    userCard,
    userCardLoading,
    isAddingVisit,
    searchInputRef,
    handleSearchChange,
    handleSearchFocus,
    handleClearSearch,
    handleSelectUser,
    handleDeselectUser,
    handleAddVisit,
  }
}
