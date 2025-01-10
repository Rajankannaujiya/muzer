import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

const UpvoteSchema = z.object({
    streamId: z.string()
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    console.log("Session data:", session); // Log session for debugging

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

    console.log("User found:", user);

    if (!user) {
        return NextResponse.json({
            message: "UnAuthenticated! no user"
        }, {
            status: 403
        });
    }

    try {
        const data = UpvoteSchema.parse(await req.json());
        console.log("Upvote details:", data.streamId, user.id);


        const upvoted = await prisma.upvote.create({
            data: {
                userId: user.id,
                streamId: data.streamId
            }
        });

        console.log("Upvote created:", upvoted);

        return NextResponse.json({
            message: "Successfully created"
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error during upvote:", error);
        return NextResponse.json({
            message: "Error while upvoting"
        }, {
            status: 500 // Use a more appropriate status code for server errors
        });
    }
}
