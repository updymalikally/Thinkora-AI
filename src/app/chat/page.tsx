import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ChatWorkspace } from "@/components/chat-workspace";
import { getSession } from "@/lib/auth";
export default async function ChatPage(){const session=await getSession(await headers());if(!session)redirect("/sign-in");return <ChatWorkspace/>}
