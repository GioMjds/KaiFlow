import Login from "./login"
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
}

export default function LoginPage() {
    return <Login />
}