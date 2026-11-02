"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChefHat, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Butter Chicken",
  "Chocolate Brownies",
  "Caesar Salad",
  "Avocado Toast",
  "Beef Tacos",
];

const HowToCookModal = ({ dashboardHero = false }) => {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setRecipeName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      toast.error("Please enter a recipe name");
      return;
    }
    router.push(`/recipe?cook=${encodeURIComponent(recipeName.trim())}`);
    handleOpenChange(false);
  };

  const triggerEl = dashboardHero ? (
    // Prominent hero-style trigger on the dashboard
    <button
      className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      style={{ background: "var(--terracotta-600)" }}
    >
      <ChefHat className="w-5 h-5" />
      How to Cook? — Ask AI Chef
    </button>
  ) : (
    // Compact nav trigger
    <button className="hover:text-[var(--brand-green-700)] transition-colors flex items-center gap-1.5 text-sm font-semibold text-stone-500">
      <ChefHat className="w-4.5 h-4.5 text-[var(--terracotta-600)]" />
      How to Cook?
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerEl}</DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ background: "var(--brand-green-950)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-white mb-1">
            What would you like to cook?
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-sm font-light">
            Our AI chef will guide you through the full cooking process.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="recipe-name-input"
                className="block text-sm font-semibold text-stone-700 mb-2"
              >
                Recipe name
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="recipe-name-input"
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="e.g., Chicken Biryani, Pasta Carbonara…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border text-stone-900 placeholder:text-stone-400 text-sm font-medium focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: "var(--brand-green-100)",
                    background: "var(--cream-50)",
                    "--tw-ring-color": "var(--brand-green-300)",
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                Try these
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRecipeName(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border hover:-translate-y-0.5"
                    style={{
                      color: "var(--brand-green-700)",
                      background: "var(--brand-green-50)",
                      borderColor: "var(--brand-green-100)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!recipeName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--brand-green-700)" }}
            >
              <Sparkles className="w-4 h-4" />
              Generate Recipe
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToCookModal;