"use client"
import { Button } from '@/components/ui/button';
import { signIn, useSession } from 'next-auth/react'
import React from 'react'

function SignupButton() {
    const session = useSession();
  return (
       <div>
        {!session.data?.user && <Button onClick={()=>signIn()} className='bg-primary text-primary-foreground hover:bg-primary/90 mt-0 m-2 p-3 rounded-md'>Signup</Button>}
       </div>
  )
}

export default SignupButton