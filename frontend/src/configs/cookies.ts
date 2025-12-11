/**
 * Cookie utility functions for browser environments
 */

export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);

	if (parts.length === 2) {
		return parts.pop()?.split(';').shift() || null;
	}

	return null;
}

export function setCookie(
	name: string,
	value: string,
	options: {
		days?: number;
		path?: string;
		domain?: string;
		secure?: boolean;
		sameSite?: 'Strict' | 'Lax' | 'None';
	} = {}
): void {
	if (typeof document === 'undefined') return;

	const {
		days = 7,
		path = '/',
		domain,
		secure = true,
		sameSite = 'Lax',
	} = options;

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

	let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}; SameSite=${sameSite}`;

	if (domain) cookie += `; domain=${domain}`;
	if (secure) cookie += '; Secure';

	document.cookie = cookie;
}

export function deleteCookie(name: string, path: string = '/'): void {
	if (typeof document === 'undefined') return;

	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}