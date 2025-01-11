'use client';
import { useRouter } from 'next/navigation';

export default function NavigateButton({buttonTitle,route}:{buttonTitle:string,route:string}) {
  const router = useRouter();

  return (
    <button onClick={() => router.push(`${route}`)} className='bg-primary text-primary-foreground hover:bg-primary/90 m-2 p-2 rounded-md'>
      {buttonTitle}
    </button>
  );
}