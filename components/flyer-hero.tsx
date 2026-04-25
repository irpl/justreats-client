import { HeartDecor, Ribbon, SparkleDecor } from "@/components/flyer-decor"
import { Heart } from "lucide-react"

interface FlyerHeroProps {
  topWord?: string
  bottomWord?: string
  tagline?: string
}

export function FlyerHero({
  topWord = "Jus",
  bottomWord = "Treats!",
  tagline = "Sweet treats made with love",
}: FlyerHeroProps) {
  return (
    <div className="relative pt-4 pb-10 text-center">
      {/* Decorative hearts + sparkles flanking the title */}
      <HeartDecor variant="pink" rotate={-12} className="absolute left-2 top-8 h-10 w-10 sm:h-14 sm:w-14 sm:left-8" />
      <HeartDecor variant="purple" rotate={18} className="absolute left-6 top-28 h-8 w-8 sm:h-10 sm:w-10 sm:left-16" />
      <HeartDecor variant="mint" rotate={10} className="absolute right-2 top-10 h-10 w-10 sm:h-14 sm:w-14 sm:right-8" />
      <HeartDecor variant="pink" rotate={-15} className="absolute right-6 top-32 h-8 w-8 sm:h-10 sm:w-10 sm:right-16" />

      <SparkleDecor className="absolute left-1/4 top-2 h-4 w-4" rotate={20} />
      <SparkleDecor className="absolute right-1/3 top-6 h-5 w-5" rotate={-15} />
      <SparkleDecor className="absolute right-[22%] top-24 h-3 w-3" />

      {/* Script title */}
      <h1 className="relative inline-block leading-none">
        <span className="font-script block text-[3.5rem] sm:text-[5.5rem] md:text-[7rem] text-brand-pink drop-shadow-[3px_3px_0_rgba(255,255,255,0.9)]">
          {topWord}
        </span>
        <span className="font-script block text-[3.5rem] sm:text-[5.5rem] md:text-[7rem] text-brand-purple -mt-4 sm:-mt-6 md:-mt-8 ml-8 sm:ml-16 drop-shadow-[3px_3px_0_rgba(255,255,255,0.9)]">
          {bottomWord}
        </span>
      </h1>

      {/* Tagline ribbon */}
      <div className="relative mx-auto mt-6 max-w-md">
        <Ribbon variant="pink" className="text-xs sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <Heart className="h-3 w-3 fill-brand-pink text-brand-pink" />
            <span>{tagline}</span>
            <Heart className="h-3 w-3 fill-brand-pink text-brand-pink" />
          </span>
        </Ribbon>
      </div>
    </div>
  )
}
