// ============================================================
//  useProfile — Profile and subscription management
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, subscriptionApi } from '@streamforge/api-contract'
import { QueryKeys }  from '@core/api/queryClient'
import { useAuthStore } from '@core/store/authStore'
import { useToast }   from '@core/hooks/useToast'
import type { UpdateProfileDto } from '@streamforge/api-contract'
import type { PaymentProvider } from '../utils/paymentProvider'

// ── Get current user ──────────────────────────────────────────
export function useMe() {
  const setUser = useAuthStore(s => s.setUser)

  return useQuery({
    queryKey: QueryKeys.me,
    queryFn:  async () => {
      const user = await userApi.getMe()
      setUser(user)
      return user
    },
    staleTime: 1000 * 60 * 5,   // 5 minutes
  })
}

// ── Update profile ────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser     = useAuthStore(s => s.setUser)
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => userApi.updateMe(dto),
    onSuccess: async () => {
      // Refresh full user with subscription
      const user = await userApi.getMe()
      setUser(user)
      queryClient.invalidateQueries({ queryKey: QueryKeys.me })
      toast.success('Profile updated')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to update profile'),
  })
}

// ── Get subscription ──────────────────────────────────────────
export function useSubscription() {
  return useQuery({
    queryKey: QueryKeys.mySubscription,
    queryFn:  () => subscriptionApi.getMySubscription(),
  })
}

// ── Get all plans ─────────────────────────────────────────────
export function usePlans() {
  return useQuery({
    queryKey: QueryKeys.plans,
    queryFn:  () => subscriptionApi.getPlans(),
    staleTime: Infinity,    // Plans rarely change
  })
}

// ── Create checkout session ───────────────────────────────────
export function useCreateCheckout() {
  const toast = useToast()

  return useMutation({
    mutationFn: (priceId: string) =>
      subscriptionApi.createCheckout({ priceId }),
    onError: (err: any) => toast.error(err.message ?? 'Failed to start checkout'),
  })
}

// ── Create regional checkout with Stripe fallback ──────────────
export function useCreateRegionalCheckout() {
  const toast = useToast()

  return useMutation({
    mutationFn: async ({
      priceId,
      provider,
      countryCode,
    }: {
      priceId: string
      provider: PaymentProvider
      countryCode?: string
    }) => {
      if (provider === 'stripe') {
        return subscriptionApi.createCheckout({ priceId })
      }

      try {
        const maybeRegionalCheckout = (subscriptionApi as any).createRegionalCheckout as
          | ((payload: { priceId: string; provider: PaymentProvider; countryCode?: string }) => Promise<{ url: string }>)
          | undefined

        if (!maybeRegionalCheckout) {
          throw new Error('Regional checkout endpoint not available')
        }

        return await maybeRegionalCheckout({
          priceId,
          provider,
          countryCode,
        })
      } catch {
        toast.info(`${provider} checkout unavailable right now. Falling back to Stripe.`)
        return subscriptionApi.createCheckout({ priceId })
      }
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to start checkout'),
  })
}

// ── Open billing portal ───────────────────────────────────────
export function useBillingPortal() {
  const toast = useToast()

  return useMutation({
    mutationFn: () => subscriptionApi.createPortal(),
    onError: (err: any) => toast.error(err.message ?? 'Failed to open billing portal'),
  })
}

// ── Delete account ────────────────────────────────────────────
export function useDeleteAccount() {
  const { logout } = useAuthStore()
  const toast      = useToast()

  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: async () => {
      toast.success('Account deleted')
      await logout()
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to delete account'),
  })
}
