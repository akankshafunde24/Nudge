import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";

export async function GET(){
 const session=await getSession();
 if(!session)return NextResponse.json({signedIn:false,demo:false});
 return NextResponse.json({
  signedIn:true,
  demo:session.accessToken==="demo",
  profile:{name:session.name,email:session.email,picture:session.picture||null}
 });
}
