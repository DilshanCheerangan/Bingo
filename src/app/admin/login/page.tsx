'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { adminLogin } from '@/actions/auth'

const initialState = { error: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? 'LOGGING IN...' : 'LOGIN'}
    </button>
  )
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(adminLogin, initialState)

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ORGANIZER LOGIN</h1>
          <p className="text-gray-600 mb-1">Access the community dashboard.</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">
              {state.error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="admin@bingo.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </main>
  )
}
