import { httpClient } from "@/configs/axios";
import type { LoginUserDto } from "@/types/dto/login-user.dto";
import type { SignupUserDto } from "@/types/dto/signup-user.dto";
import type { VerifyUserDto } from "@/types/dto/verify-user.dto";

const http = httpClient.endpoint('/auth');

export const auth = {
    async login(payload: LoginUserDto) {
        return http.post('/login', payload);
    },

    async logout() {
        return http.post('/logout');
    },

    async signup(payload: SignupUserDto) {
        return http.post('/signup', payload);
    },

    async verifyUser(payload: VerifyUserDto) {
        return http.post('/verify', payload);
    },

    async refresh() {
        return http.post('/refresh');
    }
}