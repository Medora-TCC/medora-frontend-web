const languageNames = new Intl.DisplayNames(["pt-BR"], { type: "language" });

export function languageName(code: string) {
  try {
    const name = languageNames.of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export const COMMON_LANGUAGES = ["pt", "en", "es", "fr", "it", "de", "ja", "zh", "ko", "ar", "ru", "he"];