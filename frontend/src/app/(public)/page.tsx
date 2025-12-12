import type { Metadata } from "next";
import Chat from "./chat";

export const metadata: Metadata = {
    title: "kaiflow",
}

export default function Home() {
    return <Chat />;
}