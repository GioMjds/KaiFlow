import type { Metadata } from "next";
import Otp from "./otp";

export const metadata: Metadata = {
    title: "Verify your Account",
};

export default function OtpPage() {
    return <Otp />
}