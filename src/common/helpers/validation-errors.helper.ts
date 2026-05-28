export function flattenValidationErrors(errors: any[]): Record<string, string> {
  const flattened: Record<string, string> = {};

  errors.forEach((error) => {
    const fieldName = error.property;
    const messages = Object.values(error.constraints || {}).join(', ');
    flattened[fieldName] = messages;
  });

  return flattened;
}
