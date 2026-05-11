// ============================================================
//  useLogin — Login form logic with React Hook Form + Zod
// ============================================================

import { useForm }      from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { z }            from 'zod'
import { useAuth }      from '@core/hooks/useAuth'
import { useToast }     from '@core/hooks/useToast'

const schema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof schema>

export function useLogin() {
  const { login, isLoading } = useAuth()
  const toast = useToast()

  const form = useForm<LoginFormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { identifier: '', password: '', rememberMe: false },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await login(values.identifier, values.password, (errorMessage) => {
      toast.error(errorMessage)
    })
  })

  return {
    form,
    onSubmit,
    isLoading,
    errors: form.formState.errors,
  }
}
