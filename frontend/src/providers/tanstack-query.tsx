'use client';

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
    children: React.ReactNode;
}

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) return makeQueryClient();
    else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export default function Providers({ children }: ProvidersProps): React.JSX.Element {
    return (
        <QueryClientProvider client={getQueryClient()}>
            {children}
        </QueryClientProvider>
    );
}