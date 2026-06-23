'use client'

import { useState } from 'react'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string, name?: string) => Promise<void>
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(email, password, mode === 'signup' ? name : undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary-dark mb-1">
            你的名字
          </label>
          <input
            id="name"
            type="text"
            placeholder="输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors"
            required
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-dark mb-1">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          placeholder="输入你的邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-primary-dark mb-1">
          密码
        </label>
        <input
          id="password"
          type="password"
          placeholder="输入密码（至少6位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors"
          required
          minLength={6}
        />
      </div>
      {error && (
        <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
          <p className="text-accent-red text-sm">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            处理中...
          </span>
        ) : (
          mode === 'login' ? '登录' : '注册'
        )}
      </button>
    </form>
  )
}
