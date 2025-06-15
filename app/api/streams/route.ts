/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"
import { z } from 'zod';
// @ts-ignore
import youtubesearchapi from "youtube-search-api"
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;



const CreateStreameSchema = z.object({
    creatorId: z.string(),
    url: z.string().url()
})


function extractYouTubeId(url: string): string | null {
  const match = url.match(
    YT_REGEX
  );
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const dataDetail = CreateStreameSchema.parse(await req.json());

    const extractedId = extractYouTubeId(dataDetail.url);
    if (!extractedId) {
      return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 411 });
    }

    const response = await youtubesearchapi.GetVideoDetails(extractedId);

    let thumbnails = response?.thumbnail?.thumbnails;
    const defaultThumb = "https://images.pexels.com/photos/1000602/pexels-photo-1000602.jpeg?auto=compress&cs=tinysrgb&w=300";

    if (!Array.isArray(thumbnails) || thumbnails.length === 0) {
      thumbnails = [{ url: defaultThumb, width: 300 }];
    }

    // Sort thumbnails by width
    thumbnails.sort((a: { width: number }, b: { width: number }) => a.width - b.width);

    const userExists = await prisma.user.findUnique({
      where: { id: dataDetail.creatorId },
    });

    if (!userExists) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const stream = await prisma.stream.create({
      data: {
        userId: dataDetail.creatorId,
        url: dataDetail.url,
        extractedId: extractedId || "unknown",
        type: "Youtube",
        title: response?.title ?? "Untitled Video",
        smallImg:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[0].url ?? defaultThumb,
        bigImg: thumbnails[thumbnails.length - 1].url ?? defaultThumb,
      },
    });

    return NextResponse.json({
      ...stream,
      haveUpvoted: false,
      upvotes: 0,
    });
  } catch (error: any) {
    console.error("API Error in /api/streams:", error.message || error);
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {

    console.log("the creatorId is", req.nextUrl.searchParams.get("creatorId"));

    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const session = await getServerSession(NEXT_AUTH_CONFIG);



    if (!(session?.user)) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 403
        })
    }

    const user = await prisma.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if (!creatorId) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    console.log(user);

    if (!user) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 403
        })
    }


    const [streams, activeStreams] = await Promise.all([await prisma.stream.findMany({
        where: {
            userId: creatorId,
            played: false
        },
        include: {
            _count: {
                select: {
                    upvotes: true,
                }
            },
            upvotes: {
                where: {
                    userId: user.id
                }
            },
        }
    }), prisma.currentStream.findFirst({
        where: {
            userId: creatorId
        },
        include: {
            stream: true
        }
    })
    ])

    return NextResponse.json({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false,
        })),
        activeStreams
    })
}
