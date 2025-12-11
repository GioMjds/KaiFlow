import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ChatConversationPage from "./fetch-comversation";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ chatId: string }>;
}) {
    try {
        
    } catch (error) {
        
    }
}

export default async function ChatConversation({
    params
}: {
    params: Promise<{ chatId: string }>;
}) {
    const { chatId } = await params;
    const queryClient = new QueryClient();

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ChatConversationPage />
        </HydrationBoundary>
    )
}