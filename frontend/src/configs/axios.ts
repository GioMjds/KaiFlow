import axios, {
	AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
} from 'axios';
import { getCookie } from './cookies';

export interface ApiResponse<T = any> {
	data?: T;
	error?: string;
	success: boolean;
}

export interface ApiErrorResponse {
	message: Record<string, string> | string;
	error: string;
	statusCode: number;
}

export class ApiError extends Error {
	public fieldErrors: Record<string, string> | null;
	public statusCode: number;

	constructor(message: string, fieldErrors: Record<string, string> | null = null, statusCode: number = 400) {
		super(message);
		this.name = 'ApiError';
		this.fieldErrors = fieldErrors;
		this.statusCode = statusCode;
	}
}

export interface RequestConfig {
	headers?: Record<string, string>;
	params?: Record<string, any>;
	timeout?: number;
	withCredentials?: boolean;
	data?: any;
}

export class ApiClient {
	private axiosInstance: AxiosInstance;
	private baseUrl: string;
	private endpointPrefix: string = '';

	constructor(config: AxiosRequestConfig = {}) {
		this.baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;

		this.axiosInstance = axios.create({
			baseURL: this.baseUrl,
			headers: {
				'Content-Type': 'application/json',
				...config.headers,
			},
		});

		this.setupInterceptors();
	}

	public endpoint(url: string): ApiClient {
		const scopedClient = Object.create(this);
		scopedClient.endpointPrefix = url;
		return scopedClient;
	}

	private getFullUrl(url: string): string {
		return `${this.endpointPrefix}${url}`;
	}

	private setupInterceptors(): void {
		this.axiosInstance.interceptors.request.use(
			(config) => {
				const token = getCookie('access_token');
				if (token && config.headers)
					config.headers.Authorization = `Bearer ${token}`;
				return config;
			},
			(error) => Promise.reject(error)
		);

		this.axiosInstance.interceptors.response.use(
			(response: AxiosResponse) => response.data,
			(error: AxiosError<ApiErrorResponse>) => {
				const data = error?.response?.data;
				const statusCode = error?.response?.status || 400;

				// Handle validation errors (message is an object with field errors)
				if (data?.message && typeof data.message === 'object') {
					const fieldErrors = data.message as Record<string, string>;
					const firstError = Object.values(fieldErrors)[0] || 'Validation error';
					return Promise.reject(new ApiError(firstError, fieldErrors, statusCode));
				}

				// Handle string message errors
				if (typeof data?.message === 'string') {
					return Promise.reject(new ApiError(data.message, null, statusCode));
				}

				// Fallback to error field or generic message
				const errorMsg = data?.error || error.message || 'An unexpected error occurred';
				return Promise.reject(new ApiError(errorMsg, null, statusCode));
			}
		);
	}

	async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
		return this.axiosInstance.get<T>(this.getFullUrl(url), {
			...config,
			withCredentials: true,
		}) as Promise<T>;
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> {
		return this.axiosInstance.post<T>(this.getFullUrl(url), data, {
			...config,
			withCredentials: true,
		}) as Promise<T>;
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> {
		return this.axiosInstance.put<T>(this.getFullUrl(url), data, {
			...config,
			withCredentials: true,
		}) as Promise<T>;
	}

	async patch<T = any>(
		url: string,
		data?: any,
		config?: RequestConfig
	): Promise<T> {
		return this.axiosInstance.patch<T>(this.getFullUrl(url), data, {
			...config,
			withCredentials: true,
		}) as Promise<T>;
	}

	async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
		return this.axiosInstance.delete<T>(this.getFullUrl(url), {
			...config,
			withCredentials: true,
		}) as Promise<T>;
	}
}

export const httpClient = new ApiClient();

// Re-export types for convenience
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };
