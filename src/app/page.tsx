"use client"

import { Navbar, Footer } from "@/components/layout"
import { UserGuide } from "@/components/guide"
import { HeroSection } from "./HeroSection"
import { FeaturedRankings } from "./FeaturedRankings"
import { CategoriesSection } from "./CategoriesSection"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedRankings />
        <CategoriesSection />
      </main>
      <Footer />
      <UserGuide />
    </div>
  )
}
