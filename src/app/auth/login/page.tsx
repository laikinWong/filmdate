'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import { signIn } from '@/lib/auth'
import Layout from '@/components/Layout'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password)
    router.push('/')
  }

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
              欢迎回来
            </h1>
            <p className="text-primary-dark/60">
              登录以继续你们的故事
            </p>
          </div>
          <AuthForm mode="login" onSubmit={handleLogin} />
          <p className="text-center mt-6 text-primary-dark/60">
            还没有账号？{' '}
            <Link href="/auth/signup" className="text-accent-gold hover:underline font-medium">
              注册
            </Link>
          </p>
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-primary-dark/40 hover:text-primary-dark/60">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
