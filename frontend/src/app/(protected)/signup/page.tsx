import type { Metadata } from "next";
import Signup from "./signup";

export const metadata: Metadata = {
    title: "Create New Account",
    description: "Create an account to start using Kaiflow",
}

export default function SignupPage() {
    return <Signup />
}