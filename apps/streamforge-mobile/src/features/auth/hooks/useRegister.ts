// ============================================================
//  useRegister — Registration form logic
// ============================================================

import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { useAuth }     from '@core/hooks/useAuth'
import { useToast }    from '@core/hooks/useToast'
import { VALIDATION }  from '@shared/constants'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .toLowerCase()
    .trim(),
  username: z
    .string()
    .min(VALIDATION.USERNAME_MIN_LENGTH, `Minimum ${VALIDATION.USERNAME_MIN_LENGTH} characters`)
    .max(VALIDATION.USERNAME_MAX_LENGTH, `Maximum ${VALIDATION.USERNAME_MAX_LENGTH} characters`)
    .regex(VALIDATION.USERNAME_REGEX, 'Letters, numbers and underscores only')
    .toLowerCase(),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  displayName: z.string().max(50).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

export type RegisterFormValues = z.infer<typeof schema>

export function useRegister() {
  const { register, isLoading } = useAuth()
  const toast = useToast()

  const form = useForm<RegisterFormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      email:           '',
      username:        '',
      password:        '',
      confirmPassword: '',
      displayName:     '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await register(
      values.email,
      values.username,
      values.password,
      (errorMessage) => { toast.error(errorMessage) },
      values.displayName || undefined
    )
  })

  return {
    form,
    onSubmit,
    isLoading,
    errors: form.formState.errors,
  }
}
