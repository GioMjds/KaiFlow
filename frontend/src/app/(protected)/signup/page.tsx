import type { Metadata } from "next";
import Signup from "./signup";

export const metadata: Metadata = {
    title: "Sign Up for Kaiflow",
    description: "Create an account to start using Kaiflow",
}

export default function SignupPage() {
    return <Signup />
}