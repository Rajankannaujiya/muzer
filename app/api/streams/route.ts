/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"
import {z} from 'zod';
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;



const CreateStreameSchema =z.object({
    creatorId: z.string(),
    url: z.string().url()
})

export async function POST(req:NextRequest){
  try {
      const dataDetail = CreateStreameSchema.parse(await req.json());

      const isYt = dataDetail.url.match(YT_REGEX);

      if(!isYt){
        return NextResponse.json({
          message:"Wrong url format"
      },{
          status:411
      })
      }

      const extractedId= dataDetail.url.split("?v=")[1];

      const response = await youtubesearchapi.
      GetVideoDetails(extractedId);

      console.log(response.title);
      console.log(response.thumbnail.thumbnails);
      const thumbnails = response.thumbnail.thumbnails;
      thumbnails.sort((a:{width:number},b:{width:number})=>a.width<b.width ? -1: 1)
      console.log(thumbnails);

     const stream =await prisma.stream.create({
        data:{
            userId:dataDetail.creatorId,
            url:dataDetail.url,
            extractedId:extractedId,
            type : "Youtube",
            title: response.title ?? "Cannot find video",
            smallImg: (thumbnails.length >1 ? thumbnails[thumbnails.length -2].url : thumbnails[thumbnails.length -1].url) ?? "https://images.pexels.com/photos/1000602/pexels-photo-1000602.jpeg?auto=compress&cs=tinysrgb&w=300",
            bigImg:thumbnails[thumbnails.length -1].url ?? "https://images.pexels.com/photos/1000602/pexels-photo-1000602.jpeg?auto=compress&cs=tinysrgb&w=300",
    
        }
      })

      return NextResponse.json({
          ...stream,
          haveUpvoted:false,
          upvotes:0
      })
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({
        message:"Error while adding a stream"
    },{
        status:411
    })
  }
}


export async function GET(req:NextRequest){

  console.log("the creatorId is",req.nextUrl.searchParams.get("creatorId"));

  const creatorId = req.nextUrl.searchParams.get("creatorId");

  // const streams = await prisma.stream.findMany({
  //     where:{
  //         userId: creatorId ?? ""
  //     }
  // })

  const session = await getServerSession(NEXT_AUTH_CONFIG);

    

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

    if(!creatorId){
      return NextResponse.json({
        message:"Unauthenticated"
      },{
        status:403
      })
    }

    console.log(user);

    if(!user){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status:403
        })
    }
    

    const [streams, activeStreams] = await Promise.all([await prisma .stream.findMany({
        where:{
            userId: creatorId,
            played:false
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
    }), prisma.currentStream.findFirst({
        where:{
            userId: creatorId
        },
        include:{
            stream:true
        }
    })
])

    return NextResponse.json({
        streams:streams.map(({_count,...rest})=>({
            ...rest,
            upvotes:_count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false,
        })),
        activeStreams
    })
  }