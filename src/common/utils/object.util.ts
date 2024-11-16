// src/common/utils/object.util.ts

/**
 * Removes all properties from an object that start with an underscore (_) or are specified in keysToRemove.
 * Additionally, maps the `_id` property to `id`.
 * @param obj The object to sanitize.
 * @param keysToRemove An array of specific keys to remove.
 * @returns A new object without the specified keys and with `_id` mapped to `id`.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, keysToRemove: string[] = []): Partial<T> {
	return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
		if (key === '_id') {
			acc['id'] = obj[key].toString(); // Ensure the ID is a string
		} else if (!key.startsWith('_') && !keysToRemove.includes(key)) {
			acc[key] = obj[key];
		}
		return acc;
	}, {}) as Partial<T>;
}
