import arcjet, {
  shield,
  detectBot,
  tokenBucket,
} from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY || process.env.NEXT_PUBLIC_ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
      ],
    }),
  ],
});

// Unlimited scans & recommendations (no pro tier restrictions)
export const proTierLimit = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 1000,
    interval: "1d",
    capacity: 1000,
  })
);

export const freePantryScans = proTierLimit;
export const freeMealRecommendations = proTierLimit;