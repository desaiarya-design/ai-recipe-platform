import React from "react";
import { getRecipeOfTheDay } from "@/actions/dashboard.actions";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, Users, ArrowRight, Globe } from "lucide-react";
import { getCategoryEmoji, getCountryFlag } from "@/lib/data";
import HowToCookModal from "@/components/HowToCookModal";

const categories = ["breakfast", "lunch", "dinner", "snack", "dessert"];

const cuisines = [
  "Italian", "Indian", "Chinese", "Mexican", "American",
  "Thai", "Japanese", "Mediterranean", "French", "Korean",
  "Vietnamese", "Spanish", "Greek", "Turkish", "Moroccan",
  "Brazilian", "Caribbean", "Middle Eastern", "British",
  "German", "Portuguese",
];

const DashboardPage = async () => {
  const recipeData = await getRecipeOfTheDay();
  const recipeOfTheDay = recipeData?.recipe;

  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--cream-50)" }}>

      {/* ── Hero search band ─────────────────────────────────────────── */}
      <section
        className="px-4 py-16 md:py-20"
        style={{ background: "var(--brand-green-950)" }}
      >
        <div className="section-container text-center">
          <p
            className="pill mb-5 mx-auto text-[var(--brand-green-400)]"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Flame className="w-3.5 h-3.5" />
            Fresh recipes served daily
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            What would you like to cook today?
          </h1>
          <p className="text-stone-400 text-lg font-light mb-10 max-w-xl mx-auto">
            Discover thousands of AI-generated recipes from around the world, or ask our AI chef directly.
          </p>

          {/* Inline "How to Cook?" CTA */}
          <div className="inline-block">
            <HowToCookModal dashboardHero />
          </div>
        </div>
      </section>

      <div className="section-container py-16 space-y-20">

        {/* ── Recipe of the Day ─────────────────────────────────────── */}
        {recipeOfTheDay && (
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--terracotta-50)" }}
              >
                <Flame className="w-4 h-4" style={{ color: "var(--terracotta-600)" }} />
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-900">Recipe of the Day</h2>
            </div>

            <Link
              href={`/recipe?cook=${encodeURIComponent(
                recipeOfTheDay.title || recipeOfTheDay.strMeal || "Featured Recipe"
              )}`}
            >
              <div
                className="group relative bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="grid md:grid-cols-5">
                  {/* Image */}
                  <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto min-h-64">
                    <Image
                      src={
                        recipeOfTheDay.imageUrl ||
                        recipeOfTheDay.strMealThumb ||
                        "/placeholder.png"
                      }
                      alt={
                        recipeOfTheDay.title ||
                        recipeOfTheDay.strMeal ||
                        "Recipe of the day"
                      }
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    {/* Overlay badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className="pill text-xs text-white shadow-lg"
                        style={{ background: "var(--terracotta-600)" }}
                      >
                        <Flame className="w-3 h-3" />
                        Featured Today
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(recipeOfTheDay.category || recipeOfTheDay.strCategory) && (
                        <span
                          className="pill text-xs capitalize"
                          style={{
                            color: "var(--terracotta-700)",
                            background: "var(--terracotta-50)",
                            border: "1px solid var(--terracotta-100)",
                          }}
                        >
                          {recipeOfTheDay.category || recipeOfTheDay.strCategory}
                        </span>
                      )}
                      {(recipeOfTheDay.cuisine || recipeOfTheDay.strArea) && (
                        <span
                          className="pill text-xs"
                          style={{
                            color: "var(--brand-green-700)",
                            background: "var(--brand-green-50)",
                            border: "1px solid var(--brand-green-100)",
                          }}
                        >
                          <Globe className="w-3 h-3" />
                          {recipeOfTheDay.cuisine || recipeOfTheDay.strArea}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-3 group-hover:text-[var(--brand-green-700)] transition-colors leading-tight">
                      {recipeOfTheDay.title || recipeOfTheDay.strMeal || "Recipe of the Day"}
                    </h3>

                    {(recipeOfTheDay.description || recipeOfTheDay.strInstructions) && (
                      <p className="text-stone-500 font-light leading-relaxed mb-6 line-clamp-2 text-base">
                        {recipeOfTheDay.description || recipeOfTheDay.strInstructions}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-5 text-sm text-stone-500 mb-8">
                      {recipeOfTheDay.prepTime != null && recipeOfTheDay.cookTime != null && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[var(--brand-green-500)]" />
                          {(parseInt(recipeOfTheDay.prepTime) || 0) + (parseInt(recipeOfTheDay.cookTime) || 0)} mins total
                        </span>
                      )}
                      {recipeOfTheDay.serving != null && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[var(--brand-green-500)]" />
                          {recipeOfTheDay.serving} servings
                        </span>
                      )}
                    </div>

                    <div>
                      <button
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                        style={{ background: "var(--brand-green-700)" }}
                      >
                        Start Cooking
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── Browse by Category ─────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-1.5">
              Browse by Category
            </h2>
            <p className="text-stone-500 font-light">Find recipes that match your mood.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category} href={`/recipes/category/${category}`}>
                <div className="card-base p-5 card-hover text-center group cursor-pointer">
                  <div className="text-4xl mb-3">{getCategoryEmoji(category)}</div>
                  <p className="font-semibold capitalize text-stone-700 text-sm group-hover:text-[var(--brand-green-700)] transition-colors">
                    {category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Explore Cuisines ───────────────────────────────────────── */}
        <section className="pb-8">
          <div className="mb-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-1.5">
              Explore World Cuisines
            </h2>
            <p className="text-stone-500 font-light">Travel the globe through food.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine}
                href={`/recipes/cuisine/${cuisine.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="card-base p-5 card-hover text-center group cursor-pointer">
                  <div className="text-3xl mb-2.5">{getCountryFlag(cuisine)}</div>
                  <p className="font-semibold text-stone-700 text-sm group-hover:text-[var(--brand-green-700)] transition-colors">
                    {cuisine}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;