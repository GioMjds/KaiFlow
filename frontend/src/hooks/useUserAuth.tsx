import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { auth } from "@/gateways/Auth";
import { LoginUserDto } from "@/types/dto/login-user.dto";
import { SignupUserDto } from "@/types/dto/signup-user.dto";
import { VerifyUserDto } from "@/types/dto/verify-user.dto";

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: LoginUserDto) => auth.login(payload),
        onSuccess: () => {
            console.log("Login successful");
            router.push('/');
        },
        onError: (error: any) => {
            console.error("Error during login:", error);
        }
    });
};

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => auth.logout(),
        onSuccess: () => {
            console.log("Logout successful");
        },
        onError: (error: any) => {
            console.error("Error during logout:", error);
        }
    });
};

export const useSignup = () => {
    return useMutation({
        mutationFn: async (payload: SignupUserDto) => auth.signup(payload),
        onSuccess: () => {
            console.log("Signup successful");
        },
        onError: (error: any) => {
            console.error("Error during signup:", error);
        }
    });
};

export const useVerifyUser = () => {
    return useMutation({
        mutationFn: async (payload: VerifyUserDto) => auth.verifyUser(payload),
        onSuccess: () => {
            console.log("User verification successful");
        },
        onError: (error: any) => {
            console.error("Error during user verification:", error);
        }
    });
};