'use client';

import { signIn, signOut } from 'next-auth/react';

export const SignIn = () => <button onClick={() => signIn()}>signIn</button>;
export const SignOut = () => <button onClick={() => signOut()}>signOut</button>;
