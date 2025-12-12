import { httpClient } from "@/configs/axios";

type Provider = "google" | "github";

const http = httpClient.endpoint("/auth");
const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const BASE_OAUTH_URL = `${PUBLIC_API_URL}/api/auth`;

const loginPath = (provider: Provider) => `${BASE_OAUTH_URL}/${provider}/login`;

const clientIds: Record<Provider, string | undefined> = {
	google: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
	github: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
};

const redirectBrowser = (provider: Provider) => {
	if (typeof window === "undefined") {
		return;
	}
	window.location.href = loginPath(provider);
};

export const oauth = {
	googleLoginUrl(): string {
		return loginPath("google");
	},
	githubLoginUrl(): string {
		return loginPath("github");
	},
	startGoogleLogin() {
		redirectBrowser("google");
	},
	startGithubLogin() {
		redirectBrowser("github");
	},
	clientId(provider: Provider): string | undefined {
		return clientIds[provider];
	},
	async refresh() {
		return http.post("/refresh");
	},
};