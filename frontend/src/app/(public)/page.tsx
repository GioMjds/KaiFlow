import type { Metadata } from "next";
import Chat from "./chat";

export const metadata: Metadata = {
    title: "Kaiflow",
}

export default function Home() {
    return <Chat />;
}