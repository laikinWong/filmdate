'use client'

import { useState } from 'react'

interface InviteCodeProps {
  code: string
  onJoin: (code: string) => Promise<void>
}

export default function InviteCode({ code, onJoin }: InviteCodeProps) {
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleJoin = async () => {
    if (inputCode.length !== 6) return
    
    setLoading(true)
    setError('')
    try {
      await onJoin(inputCode.toUpperCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      {code && (
        <div className="text-center">
          <p className="text-primary-dark/60 mb-3 font-medium">你的邀请码</p>
          <div className="relative inline-block">
            <div className="text-5xl font-mono tracking-[0.3em] text-accent-gold bg-primary-dark/5 p-6 rounded-xl border-2 border-dashed border-accent-gold/30">
              {code}
            </div>
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 px-3 py-1 bg-accent-gold text-primary-dark text-xs rounded-full hover:bg-accent-gold/90 transition-colors font-medium"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="text-sm text-primary-dark/40 mt-3">
            分享这个邀请码给你的另一半
          </p>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-dark/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-primary-light text-primary-dark/40">或者</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-primary-dark/60 mb-3 font-medium">输入对方的邀请码</p>
        <div className="flex gap-3 justify-center">
          <input
            type="text"
            placeholder="输入6位邀请码"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-48 p-3 text-center text-2xl font-mono tracking-[0.2em] bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors"
          />
          <button
            onClick={handleJoin}
            disabled={inputCode.length !== 6 || loading}
            className="px-6 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '...' : '加入'}
          </button>
        </div>
        {error && (
          <p className="text-accent-red text-sm mt-3">{error}</p>
        )}
      </div>
    </div>
  )
}
