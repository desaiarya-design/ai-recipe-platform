import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, ChefHat, BookOpen, Search, Check } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Scan Your Pantry",
    description: "Point your camera at any fridge or pantry shelf. AI instantly identifies every ingredient.",
    tag: "AI-Powered",
  },
  {
    icon: ChefHat,
    title: "Generate Recipes",
    description: "Transform random ingredients into gourmet meals crafted by AI chef logic. Zero food waste.",
    tag: "Instant",
  },
  {
    icon: Search,
    title: "Search Any Dish",
    description: "Crave something specific? Search any recipe and get detailed step-by-step instructions.",
    tag: "1M+ Recipes",
  },
  {
    icon: BookOpen,
    title: "Your Digital Cookbook",
    description: "Save favourites, export as PDF, and build a personal cookbook that grows with you.",
    tag: "Unlimited Saves",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Scan",
    description: "Point camera at your fridge. AI identifies every ingredient in seconds.",
  },
  {
    number: "02",
    title: "Select",
    description: "Browse AI-generated recipe suggestions ranked by ingredient match.",
  },
  {
    number: "03",
    title: "Savor",
    description: "Follow clear step-by-step instructions and enjoy a chef-quality meal.",
  },
];

const STATS = [
  { value: "1M+", label: "Recipes Generated" },
  { value: "$0", label: "To Get Started" },
  { value: "4.9★", label: "User Rating" },
  { value: "∞", label: "AI Scans" },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream-50)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div className="text-center lg:text-left">
              <div
                className="pill mb-6 text-[var(--brand-green-700)]"
                style={{ background: "var(--brand-green-50)", border: "1px solid var(--brand-green-100)" }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--brand-green-500)] animate-pulse" />
                AI Kitchen Assistant — Free Forever
              </div>

              <h1
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
                style={{ color: "var(--brand-green-950)" }}
              >
                Turn your{" "}
                <em
                  className="not-italic"
                  style={{ color: "var(--terracotta-600)" }}
                >
                  leftovers
                </em>{" "}
                into masterpieces.
              </h1>

              <p className="text-lg sm:text-xl text-stone-500 font-light leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Snap a photo of your fridge. Get instant, chef-quality recipes tailored
                to exactly what you have. Save money, reduce waste, eat better tonight.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/dashboard">
                  <button
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "var(--brand-green-700)" }}
                  >
                    Start Cooking Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/pantry">
                  <button
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all hover:-translate-y-0.5 border"
                    style={{
                      color: "var(--brand-green-700)",
                      borderColor: "var(--brand-green-200)",
                      background: "var(--brand-green-50)",
                    }}
                  >
                    <Camera className="w-4 h-4" />
                    Scan Pantry
                  </button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start text-sm text-stone-500">
                {["No credit card", "Instant results", "100% free"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--brand-green-500)]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right – hero image */}
            <div className="relative">
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 aspect-[4/5] max-w-sm mx-auto lg:max-w-none"
                style={{ borderColor: "var(--brand-green-100)" }}
              >
                <Image
                  src="/pasta-dish.png.png"
                  alt="Rustic Tomato Basil Pasta – a delicious AI-generated recipe"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Floating recipe card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/80">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-display font-bold text-stone-900 text-sm leading-tight">
                        Rustic Tomato Basil Pasta
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">Italian · 25 mins · 2 servings</p>
                    </div>
                    <span
                      className="pill text-xs text-[var(--brand-green-700)] shrink-0 ml-2"
                      style={{ background: "var(--brand-green-50)", border: "1px solid var(--brand-green-100)" }}
                    >
                      98% match
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating stat badge */}
              <div
                className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-lg text-white text-center hidden lg:block"
                style={{ background: "var(--brand-green-700)" }}
              >
                <p className="text-2xl font-bold font-display">1M+</p>
                <p className="text-xs opacity-80">Recipes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section style={{ background: "var(--brand-green-950)" }} className="py-12 px-4">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  {value}
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--brand-green-400)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="section-container">
          <div className="text-center mb-16">
            <p className="pill mb-4 mx-auto text-[var(--terracotta-600)]"
              style={{ background: "var(--terracotta-50)", border: "1px solid var(--terracotta-100)" }}
            >
              Features
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Your smart kitchen, supercharged
            </h2>
            <p className="text-stone-500 text-lg font-light max-w-xl mx-auto">
              Everything you need to cook smarter, waste less, and eat better every day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, tag }) => (
              <div
                key={title}
                className="card-base p-7 card-hover group"
                style={{ background: "white" }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                    style={{ background: "var(--brand-green-50)" }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors"
                      style={{ color: "var(--brand-green-700)" }}
                    />
                  </div>
                  <span
                    className="pill text-xs"
                    style={{
                      color: "var(--brand-green-700)",
                      background: "var(--brand-green-50)",
                      border: "1px solid var(--brand-green-100)",
                    }}
                  >
                    {tag}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-500 font-light leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section
        className="py-24 px-4"
        style={{ background: "var(--brand-green-950)" }}
      >
        <div className="section-container">
          <div className="text-center mb-16">
            <p
              className="pill mb-4 mx-auto"
              style={{
                color: "var(--brand-green-400)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              How It Works
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Cook in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ number, title, description }) => (
              <div key={number} className="text-center group">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-2xl font-bold font-display"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--terracotta-400)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {number}
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{title}</h3>
                <p className="text-stone-400 font-light leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/dashboard">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "var(--terracotta-600)",
                  color: "white",
                }}
              >
                Start Cooking Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
