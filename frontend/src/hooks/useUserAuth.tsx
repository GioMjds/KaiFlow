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
        onSuccess: (data) => {
            console.log(data.message);
            router.push('/');
        },
        onError: (error) => {
            console.error(error.message);
        }
    });
};

export const useLogout = () => {
    const router = useRouter();
    
    return useMutation({
        mutationFn: async () => auth.logout(),
        onSuccess: (data) => {
            console.log(data.message);
            router.push('/login');
        },
        onError: (error) => {
            console.error(error.message);
        }
    });
};

export const useSignup = () => {
    const router = useRouter();
    
    return useMutation({
        mutationFn: async (payload: SignupUserDto) => auth.signup(payload),
        onSuccess: (data, variables) => {
            console.log(data.message);
            router.push(`/otp?email=${encodeURIComponent(variables.email)}`);
        },
        onError: (error) => {
            console.error(error.message);
        }
    });
};

export const useVerifyUser = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: VerifyUserDto) => {
            if (!payload.email) {
                throw new Error("Email is required for verification.");
            }
            return auth.verifyUser(payload);
        },
        onSuccess: (data) => {
            console.log(data.message);
            router.push('/');
        },
        onError: (error) => {
            console.error(error.message);
        }
    });
};

export const useResendOtp = () => {
    return useMutation({
        mutationFn: async (email: string) => auth.resendOtp(email),
        onSuccess: (data) => {
            console.log(data.message);
        },
        onError: (error) => {
            console.error(error.message);
        }
    });
};