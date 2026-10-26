import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
export default async function Home() { const session = await getSession(await headers()); redirect(session ? "/chat" : "/sign-in"); }
