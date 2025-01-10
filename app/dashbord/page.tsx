"use client"

import StreamView from "../components/StreamView";

const creatorId = "a9e119bf-4d1c-42f6-b096-17a02ae0b5e2";

export default function Component() {
  return <StreamView creatorId={creatorId} playVideo={true}/>
}