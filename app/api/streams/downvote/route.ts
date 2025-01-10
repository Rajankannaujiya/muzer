/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"
import {z} from 'zod';
import { getServerSession } from "next-auth";
// import { NEXT_AUTH_CONFIG } from "@/lib/auth";


const UpvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req:NextRequest){
    const session = await getServerSession();
    // todo: Replace this with id everywhere 

    console.log("this is the user id",session?.user)
    if(!session?.user){
        return NextResponse.json({
            message:"UnAuthenticated! login"
        },{
            status:403
        })
    }

    const user = await prisma.user.findFirst({
        where:{
            // @ts-ignore
            id: session?.user?.id
        }
    })

    if(!user){
        return NextResponse.json({
            message:"UnAuthenticated! no user"
        },{
            status:403
        })
    }

    try {

        const data = UpvoteSchema.parse(await req.json());

        await prisma.upvote.delete({
            where:{
                userId_streamId:{
                    userId:user.id,
                    streamId: data.streamId
                }
            }
        })
        return NextResponse.json({
            message:"successfully created"
        },{
            status:200
        })
    } catch (error) {
        return NextResponse.json({
            message:"Error while upvoting"
        },{
            status:411
        })
    }

}