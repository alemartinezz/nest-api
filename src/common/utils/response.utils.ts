// src/common/utils/object.util.ts

export function sanitizeObject(
	obj: Record<string, any>,
	keysToRemove: string[] = []
): Record<string, any> {
	// Always remove 'password' by adding it to keysToRemove
	const updatedKeysToRemove = [...keysToRemove, 'password'];

	return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
		if (key === '_id') {
			acc['id'] = obj[key]?.toString(); // Ensure the ID is a string
		} else if (
			!key.startsWith('_') &&
			!updatedKeysToRemove.includes(key)
		) {
			acc[key] = obj[key];
		}
		return acc;
	}, {});
}
