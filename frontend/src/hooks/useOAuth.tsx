import { useMutation } from "@tanstack/react-query";
import { oauth } from "@/gateways/OAuth";

export const useGoogle = () => {
    return useMutation({
        mutationFn: async () => oauth.startGoogleLogin(),
        onSuccess: () => {
            console.log("Redirecting to Google OAuth login...");
        },
        onError: (error: any) => {
            console.error("Error starting Google OAuth login:", error);
        }
    });
};

export const useGitHub = () => {
    return useMutation({
        mutationFn: async () => oauth.startGithubLogin(),
        onSuccess: () => {
            console.log("Redirecting to GitHub OAuth login...");
        },
        onError: (error: any) => {
            console.error("Error starting GitHub OAuth login:", error);
        }
    });
};