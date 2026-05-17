import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function formatRelativeTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

export function scoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-400'
  if (score >= 60) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

export function shortenFilename(name: string | null | undefined, max = 22): string {
  if (!name) return ''
  const base = name.replace(/\.[^/.]+$/, '')
  return base.length > max ? base.slice(0, max) + '…' : base
}

export function shortenTitle(title: string | null | undefined, max = 24): string {
  if (!title) return ''
  return title.length > max ? title.slice(0, max) + '…' : title
}

export function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return (email?.[0] ?? 'U').toUpperCase()
}
