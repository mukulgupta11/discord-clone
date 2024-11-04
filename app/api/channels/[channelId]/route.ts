import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function DELETE(
  req:Request,
  {params} : {params : {channelId :string}}

) {
  try{
    const profile = await currentProfile();
    const{searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if(!profile){
      return new NextResponse("Unauthorised" ,{status : 401})
    }

    if(!serverId){
      return new NextResponse("Server Id missing" ,{status: 400});
    }

    if(!params.channelId){
      return new NextResponse("Channel ID missing" , {status : 400});
    }

    const server = await db.server.update({
      where : {
        id : serverId,
        members: {
          some : {
            profileId : profile.id,
            role:{
              in : [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data : {
        channels:{
          delete :{
            id:params.channelId,
            name:{
              not: "general"
            }
          }
        }
      }
    });
    return NextResponse.json(server);

  }catch(error){
    console.log("[CHANNEL_ID_DELETE]" , error);
    return new NextResponse("Internal error" , {status: 500});
  }
  
}

export async function PATCH(
  req:Request,
  {params} : {params : {channelId :string}}

) {
  try{
    const profile = await currentProfile();
    const {name,type}  = await req.json();
    const{searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if(!profile){
      return new NextResponse("Unauthorised" ,{status : 401})
    }

    if(!serverId){
      return new NextResponse("Server Id missing" ,{status: 400});
    }

    if(!params.channelId){
      return new NextResponse("Channel ID missing" , {status : 400});
    }
    if(name === "general"){
      return new NextResponse("name cannot be 'general'" , {status : 400});
    }

    const server = await db.server.update({
      where : {
        id : serverId,
        members: {
          some : {
            profileId : profile.id,
            role:{
              in : [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data : {
        channels:{
          update:{
            where:{
              id : params.channelId,
              NOT :{
                name : "general"
              },
            },
            data :{
              name,
              type,
            }
          }
        }
      }
    });
    return NextResponse.json(server);

  }catch(error){
    console.log("[CHANNEL_ID_DELETE]" , error);
    return new NextResponse("Internal error" , {status: 500});
  }
  
}