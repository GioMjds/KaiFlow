import { useMutation } from "@tanstack/react-query";
import { review } from "@/gateways/Review";

export function reviewCodeText() {
    return useMutation({
        mutationFn: (code: string) => review.reviewCodeText(code),
        onSuccess: () => {
            console.log("Code review text submitted successfully.");
        },
        onError: (error) => {
            console.error("Error submitting code review text:", error);
        }
    });
};

export function reviewCodeFile() {
    return useMutation({
        mutationFn: (file: File) => review.reviewCodeFile(file),
        onSuccess: () => {
            console.log("Code review file submitted successfully.");
        },
        onError: (error) => {
            console.error("Error submitting code review file:", error);
        }
    });
};