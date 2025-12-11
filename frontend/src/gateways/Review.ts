import { httpClient } from "@/configs/axios";

const http = httpClient.endpoint('/review');

export const review = {
    async reviewCodeText(code: string) {
        const formData = new FormData();
        formData.append('code', code);
        return http.post('/text', formData);
    },

    async reviewCodeFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return http.post('/file', formData);
    }
}