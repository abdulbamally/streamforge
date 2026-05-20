export type PaymentProvider = "stripe" | "flutterwave" | "paystack";

const AFRICAN_COUNTRY_CODES = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CD", "CG", "CI",
  "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR",
  "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN",
  "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW",
]);

export function getCountryCodeFromLocale(locale?: string): string | undefined {
  if (!locale) return undefined;
  const normalised = locale.replace("_", "-");
  const parts = normalised.split("-");
  const country = parts[1]?.toUpperCase();
  return country && country.length === 2 ? country : undefined;
}

export function getRecommendedPaymentProvider(countryCode?: string): PaymentProvider {
  if (countryCode && AFRICAN_COUNTRY_CODES.has(countryCode.toUpperCase())) {
    return "flutterwave";
  }

  return "stripe";
}

export function getAvailableProviders(countryCode?: string): PaymentProvider[] {
  const recommended = getRecommendedPaymentProvider(countryCode);
  if (recommended === "flutterwave") {
    return ["flutterwave", "paystack", "stripe"];
  }

  return ["stripe", "flutterwave"];
}

export function getPaymentProviderLabel(provider: PaymentProvider): string {
  if (provider === "stripe") return "Stripe";
  if (provider === "flutterwave") return "Flutterwave";
  return "Paystack";
}
