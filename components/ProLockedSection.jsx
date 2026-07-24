import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProLockedSection({
  isPro,
  children,
  lockText = "This feature is available only for Pro users.",
  ctaText = "Upgrade to Pro",
}) {
  if (isPro) {
    return children;
  }

  return (
    <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 bg-orange-50 text-center">
      <Lock className="w-10 h-10 text-orange-600 mx-auto mb-4" />

      <h3 className="text-xl font-bold text-stone-900 mb-2">
        Pro Feature
      </h3>

      <p className="text-stone-600 mb-6">
        {lockText}
      </p>

      <Link href="/">
        <Button className="bg-orange-600 hover:bg-orange-700">
          {ctaText}
        </Button>
      </Link>
    </div>
  );
}