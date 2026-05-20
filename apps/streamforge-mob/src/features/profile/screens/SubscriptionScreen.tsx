import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import type { PlanInfo } from "@streamforge/api-contract";
import { Badge, Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useBillingPortal, useCreateRegionalCheckout, useMe, usePlans, useSubscription } from "../hooks/useProfile";
import {
  getAvailableProviders,
  getCountryCodeFromLocale,
  getPaymentProviderLabel,
  getRecommendedPaymentProvider,
  type PaymentProvider,
} from "../utils/paymentProvider";

function formatPrice(plan: PlanInfo) {
  if (plan.price == null) return "Contact sales";
  return `$${(plan.price / 100).toFixed(0)}/mo`;
}

export function SubscriptionScreen() {
  const { data: me } = useMe();
  const { data: plansData, isLoading } = usePlans();
  const { data: mySub } = useSubscription();
  const createCheckout = useCreateRegionalCheckout();
  const billingPortal = useBillingPortal();
  const countryCode = useMemo(
    () => getCountryCodeFromLocale(Intl.DateTimeFormat().resolvedOptions().locale),
    [],
  );
  const providers = useMemo(() => getAvailableProviders(countryCode), [countryCode]);
  const [provider, setProvider] = useState<PaymentProvider>(getRecommendedPaymentProvider(countryCode));

  async function handleUpgrade(priceId: string | null) {
    if (!priceId) return;
    const result = await createCheckout.mutateAsync({
      priceId,
      provider,
      countryCode,
    });
    await Linking.openURL(result.url);
  }

  async function handlePortal() {
    const result = await billingPortal.mutateAsync();
    await Linking.openURL(result.url);
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.subtitle}>Manage plan limits, upgrades, and billing.</Text>

      <Card style={styles.providerCard}>
        <Text style={styles.providerTitle}>Payment method</Text>
        <Text style={styles.providerSubtitle}>
          Region detected: {countryCode ?? "Unknown"} · Recommended: {getPaymentProviderLabel(getRecommendedPaymentProvider(countryCode))}
        </Text>
        <View style={styles.providerRow}>
          {providers.map((item) => {
            const isActive = item === provider;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => setProvider(item)}
                style={[styles.providerChip, isActive && styles.providerChipActive]}
              >
                <Text style={[styles.providerChipLabel, isActive && styles.providerChipLabelActive]}>
                  {getPaymentProviderLabel(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.providerHint}>
          Stripe supports US/EU best. Flutterwave is recommended for broad Africa coverage. Paystack can be preferred for Nigeria-focused checkout.
        </Text>
      </Card>

      <Card style={styles.currentCard}>
        <View style={styles.currentRow}>
          <Text style={styles.currentTitle}>Current Plan</Text>
          <Badge label={me?.plan ?? "FREE"} variant={me?.plan ?? "FREE"} />
        </View>
        <Text style={styles.currentMeta}>Status: {mySub?.status ?? "NONE"}</Text>
        <Button
          label="Open Billing Portal"
          variant="secondary"
          onPress={handlePortal}
          loading={billingPortal.isPending}
          disabled={provider !== "stripe"}
          fullWidth
        />
        {provider !== "stripe" ? (
          <Text style={styles.portalHint}>Billing portal is currently available via Stripe only.</Text>
        ) : null}
      </Card>

      {isLoading ? (
        <Text style={styles.loading}>Loading plans...</Text>
      ) : (
        <View style={styles.plans}>
          {plansData?.plans.map((plan) => {
            const isCurrent = me?.plan === plan.id;
            return (
              <Card key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.popular ? <Badge label="Popular" variant="warning" /> : null}
                </View>
                <Text style={styles.planPrice}>{formatPrice(plan)}</Text>
                <Text style={styles.planMeta}>
                  Destinations:{" "}
                  {plan.limits.maxDestinations === -1 ? "Unlimited" : plan.limits.maxDestinations}
                </Text>
                <Text style={styles.planMeta}>Max resolution: {plan.limits.maxResolution}</Text>
                <Button
                  label={isCurrent ? "Current Plan" : "Choose Plan"}
                  onPress={() => handleUpgrade(plan.priceId)}
                  disabled={isCurrent || !plan.priceId}
                  loading={createCheckout.isPending}
                  variant={isCurrent ? "secondary" : "primary"}
                  fullWidth
                />
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  currentCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  providerCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  providerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  providerSubtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  providerRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  providerChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  providerChipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  providerChipLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  providerChipLabelActive: {
    color: Colors.brandLight,
  },
  providerHint: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  currentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  currentMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  portalHint: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  loading: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  plans: {
    gap: Spacing.sm,
  },
  planCard: {
    gap: Spacing.xs,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  planName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.brandLight,
  },
  planMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
});
