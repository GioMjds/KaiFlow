import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Kaiflow",
        description: "Your AI-powered code review assistant",
        start_url: "/",
        display: "standalone",
        background_color: "#222428",
        icons: [
            {
                src: '/favicon.ico',
                sizes: '64x64',
                type: 'image/x-icon',
            }
        ]
    }
}