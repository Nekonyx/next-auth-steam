'use client'

import { signIn, signOut } from 'next-auth/react'

export function SignIn() {
  return <button onClick={() => signIn()}>signIn</button>
}

export function SignOut() {
  return <button onClick={() => signOut()}>signOut</button>
}
