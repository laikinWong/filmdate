'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import { signUp } from '@/lib/auth'
import Layout from '@/components/Layout'

export default function SignupPage() {
  const router = useRouter()

  const handleSignup = async (email: string, password: string, name?: string) => {
    await signUp(email, password, name || '')
    router.push('/pair')
  }

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
              开始你们的故事
            </h1>
            <p className="text-primary-dark/60">
              创建账号，开启复古胶片之旅
            </p>
          </div>
          <AuthForm mode="signup" onSubmit={handleSignup} />
          <p className="text-center mt-6 text-primary-dark/60">
            已有账号？{' '}
            <Link href="/auth/login" className="text-accent-gold hover:underline font-medium">
              登录
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
