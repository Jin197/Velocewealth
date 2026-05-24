/**
 * Confirmation phrases for account deletion, shareable between server
 * actions and client UI components.
 *
 * Lives in its own file (no `import 'server-only'`) so the client modal
 * can show the user the exact phrase they need to type — the server-side
 * verification in `account-deletion.ts` reuses the same constant to stay
 * in sync.
 *
 * Changing the wording is a breaking change: ensure both sides redeploy
 * together or users with the new UI will fail verification against an
 * older server.
 */
export const CONFIRMATION_PHRASES = {
  fr: 'SUPPRIMER DEFINITIVEMENT MON COMPTE',
  en: 'DELETE MY ACCOUNT PERMANENTLY',
  es: 'ELIMINAR MI CUENTA DEFINITIVAMENTE',
  ar: 'حذف حسابي نهائياً',
  pt: 'EXCLUIR MINHA CONTA PERMANENTEMENTE',
} as const;

export type ConfirmationLocale = keyof typeof CONFIRMATION_PHRASES;

/**
 * True when `input` matches the expected phrase for any of our locales —
 * lenient on whitespace, strict on the rest. We accept any locale so a
 * French speaker using the EN UI doesn't get blocked by a copy-paste.
 */
export function isValidConfirmationPhrase(input: string): boolean {
  const normalized = input.trim().replace(/\s+/g, ' ');
  return Object.values(CONFIRMATION_PHRASES).some(
    (phrase) => phrase === normalized,
  );
}
