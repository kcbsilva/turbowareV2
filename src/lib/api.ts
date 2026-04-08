import { NextRequest, NextResponse } from 'next/server'

type ParseResult<T> =
  | { body: T; error: null }
  | { body: null; error: Error }

/**
 * Safely parses the JSON body of a Next.js request.
 * Returns { body, error: null } on success or { body: null, error } on failure.
 * Use this instead of bare `await req.json()` to avoid unhandled 500s.
 */
export async function parseBody<T = Record<string, unknown>>(
  req: NextRequest,
): Promise<ParseResult<T>> {
  try {
    const body = (await req.json()) as T
    return { body, error: null }
  } catch (err) {
    return { body: null, error: err instanceof Error ? err : new Error('Invalid JSON') }
  }
}

/** Convenience: return a 400 response for parse failures. */
export function badRequest(message = 'Invalid or missing request body'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}
