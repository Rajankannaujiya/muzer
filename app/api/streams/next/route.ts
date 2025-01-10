// to play the next audio

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {

    const session = await getServerSession();
    // NEXT_AUTH_CONFIG
    console.log("Session data from the next:", session); // Log session for debugging

    if (!session?.user) {
        return NextResponse.json({
            message: "UnAuthenticated! login"
        }, {
            status: 403
        });
    }

    const user = await prisma.user.findFirst({
        where:{
            email: (session?.user as { email: string })?.email 
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "UnAuthenticated! no user"
        }, {
            status: 403
        });
    }

    const mostUpvotedStream = await prisma.stream.findFirst({
        where:{
            userId:user?.id,
            played:false
        },
        orderBy:{
            upvotes: {
                _count: 'desc'
            }
        }
    })


    await Promise.all([prisma.currentStream.upsert({
        where:{
            userId:user.id
        },
        update:{
            streamId:mostUpvotedStream?.id
        },
        create:{
            userId:user.id,
            streamId:mostUpvotedStream?.id
        }
    }), prisma.stream.update({
        where:{
            id:mostUpvotedStream?.id ?? ""
        },
        data:{
            played:true,
            playedTs:new Date()
        }
    })])

    return NextResponse.json({
       stream: mostUpvotedStream
    })
    
}