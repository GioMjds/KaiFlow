import type { Metadata } from "next";
import Otp from "./otp";

export const metadata: Metadata = {
    title: "Account Verification",
};

export default function OtpPage() {
    return <Otp />
}