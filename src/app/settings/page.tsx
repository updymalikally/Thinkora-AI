import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import SettingsPanel from "@/components/settings-panel";
export default async function SettingsPage(){if(!await getSession(await headers()))redirect("/sign-in");return <SettingsPanel/>}
