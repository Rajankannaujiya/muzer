import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    console.log("session is", session);

    console.log("session.user is", session?.user);
    

    if(!(session?.user)){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status:403
        })
    }

    const user = await prisma.user.findFirst({
        where:{
            email: session?.user?.email ?? ""
        }
    })

    console.log(user);

    if(!user){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status:403
        })
    }
    

    const streams = await prisma .stream.findMany({
        where:{
            userId: user.id
        },
        include:{
            _count:{
                select:{
                    upvotes:true,
                }
            },
            upvotes:{
                where:{
                    userId:user.id
                }
            },
        }
    })


    return NextResponse.json({
        streams:streams.map(({_count,...rest})=>({
            ...rest,
            upvotes:_count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false,
        }))
    })
}