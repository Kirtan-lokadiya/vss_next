export const decodeJwtPayload = (token) => {
	if (!token) return null;
	try {
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = typeof window === 'undefined'
			? Buffer.from(base64, 'base64').toString('utf-8')
			: decodeURIComponent(
				atob(base64)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			);
		return JSON.parse(json);
	} catch {
		return null;
	}
};

export const extractUserId = (token) => {
	const payload = decodeJwtPayload(token);
	// The environment indicates userId is at payload.userId
		return payload?.uid ?? payload?.id ?? null;
};