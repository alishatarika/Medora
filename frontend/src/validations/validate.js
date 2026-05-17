/**
 * Run a Zod schema against data.
 * Returns { success: true } or { success: false, errors: { field: firstMessage } }
 */
export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, errors: {} }
  const errors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) errors[key] = issue.message
  }
  return { success: false, errors }
}
