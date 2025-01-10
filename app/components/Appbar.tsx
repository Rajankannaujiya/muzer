"use client"
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'

function Appbar() {
    const session = useSession();
  return (
<div className='flex justify-between border-b border-gray-800 fixed top-0 left-0 right-0 bg-gray-900 z-50'>
       <div className='m-2 p-2 text-white'>
       muzicer
       </div>
       <div>
        {session.data?.user && <Button onClick={()=>signOut()} className='m-2 p-2'>Logout</Button>}
        {!session.data?.user && <Button onClick={()=>signIn()} className='m-2 p-2 '>Login</Button>}
       </div>
    </div>
  )
}

export default Appbar