import { NextResponse } from "next/server";

const Middleware = (req) => {

    const verified = req.cookies.get("verified")

    const url = req.url

    if(!verified && url.includes(process.env.NODE_ENV == "production" ? "in/dashboard" : "/dashboard")){
        return NextResponse.redirect(process.env.NEXT_PUBLIC_FRONTEND_URL)
    }
    if(verified && url.includes("/auth")){
        return NextResponse.redirect(process.env.NEXT_PUBLIC_FRONTEND_URL+"/dashboard?pageid=dashboard")
    }
}

export default Middleware