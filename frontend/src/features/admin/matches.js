export const matches = (search, ...values) => values.some((value) => value.toLowerCase().includes(search.trim().toLowerCase()));
