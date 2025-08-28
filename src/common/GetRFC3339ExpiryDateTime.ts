/**
 * Generates an RFC3339 expiry date string.
 * @param expiresIn The validity period in seconds.
 * @returns An RFC3339 expiry date string.
 */
export function getRFC3339ExpiryDateTime(expiresIn: number): string {
	return (new Date((new Date()).getTime() + expiresIn * 1000)).toISOString().replace(/\.\d{3}/, '')
}
