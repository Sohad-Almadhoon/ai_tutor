export function failure(error: string, status: 400 | 401 | 403 | 404 | 500) {
  return { success: false as const, error, status };
}

export function success<T>(data: T, status: 200 | 201 = 200) {
  return { success: true as const, status, data };
}

export function isValidId(id: number) {
  return Number.isSafeInteger(id) && id > 0;
}

export function isValidPagination(page: number, limit: number) {
  return (
    Number.isSafeInteger(page) &&
    page > 0 &&
    Number.isSafeInteger(limit) &&
    limit > 0 &&
    limit <= 100
  );
}

export function findEnumValue<T extends string>(
  values: readonly T[],
  input: string
) {
  return values.find((value) => value.toLowerCase() === input.toLowerCase());
}
