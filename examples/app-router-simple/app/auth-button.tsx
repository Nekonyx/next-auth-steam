'use client'

import { signIn, signOut } from 'next-auth/react'

export default function AuthButton() {
  return (
    <div>
      <button type="button" onClick={() => signIn()}>
        Login
      </button>
      <button type="button" onClick={() => signOut()}>
        Logout
      </button>
    </div>
  )
}
