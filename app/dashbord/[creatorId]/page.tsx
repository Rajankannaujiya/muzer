"use client"


import { useParams } from "next/navigation";
import StreamView from "../../components/StreamView";



export default function Component() {

  const { creatorId }: { creatorId: string } = useParams();

  console.log(creatorId)
  return <StreamView creatorId={creatorId} playVideo={true}/>
}