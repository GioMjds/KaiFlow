import Login from "./login"
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login to Kaiflow",
}

export default function LoginPage() {
    return <Login />
}