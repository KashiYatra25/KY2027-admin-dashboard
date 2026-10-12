// ═══════════════════════════════════════════════════════════════════
// ERROR HELPERS
// Generic helpers for extracting human-readable messages from errors.
// ═══════════════════════════════════════════════════════════════════

/**
 * Extracts a human-readable error message from an unknown error value.
 *
 * Prefers, in order:
 * 1. `error.response.data.info`
 * 2. `error.response.data.message`
 * 3. `error.message`
 * 4. the provided `fallback`
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  const axiosError = error as {
    response?: { data?: { info?: string; message?: string } };
    message?: string;
  };

  if (axiosError.response?.data?.info) {
    return axiosError.response.data.info;
  }
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError.message) {
    return axiosError.message;
  }

  return fallback;
}
