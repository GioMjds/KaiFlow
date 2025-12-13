import { useMutation } from "@tanstack/react-query";
import { oauth } from "@/gateways/OAuth";

// Helper that performs a browser redirect to the provider login URL.
const redirectToProvider = (url: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.location.href = url;
    return new Promise<void>(() => {}); // never-resolving, navigation will occur
};

export const useGoogle = () => {
    return useMutation({
        mutationFn: async () => redirectToProvider(oauth.googleLoginUrl()),
        onError: (error: any) => {
            console.error("Error starting Google OAuth login:", error?.message || error);
            return Promise.reject(error);
        }
    });
};

export const useGitHub = () => {
    return useMutation({
        mutationFn: async () => redirectToProvider(oauth.githubLoginUrl()),
        onError: (error: any) => {
            console.error("Error starting GitHub OAuth login:", error?.message || error);
            return Promise.reject(error);
        }
    });
};