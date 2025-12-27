import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

type Banner = {
  id: number
  title: string
  subtitle: string
  image: string
  cta: string
  color: string
}

const BANNERS: Banner[] = [
  {
    id: 1,
    title: "Eco-Friendly Collection",
    subtitle: "Sustainable style for a better tomorrow. Up to 40% off.",
    image: "https://plus.unsplash.com/premium_photo-1668024966086-bd66ba04262f?auto=format&fit=crop&q=80&w=2000",
    cta: "Shop Sustainable",
    color: "emerald"
  },
  {
    id: 2,
    title: "Winter Tech Essentials",
    subtitle: "State-of-the-art gadgets to keep you connected and warm.",
    image: "https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?auto=format&fit=crop&q=80&w=2000",
    cta: "Explore Tech",
    color: "indigo"
  },
  {
    id: 3,
    title: "Outdoor Adventures",
    subtitle: "Gear up for your next escape. Built for the wild.",
    image: "https://images.unsplash.com/photo-1682687218608-5e2522b04673?auto=format&fit=crop&q=80&w=2000",
    cta: "View Gear",
    color: "amber"
  },
  {
    id: 4,
    title: "Luxury Minimalism",
    subtitle: "Elegance in every detail. Premium watches and jewelry.",
    image: "https://images.unsplash.com/photo-1541890289-b86df5bafd81?auto=format&fit=crop&q=80&w=2000",
    cta: "Shop Luxury",
    color: "rose"
  }
]

const AUTOPLAY_DELAY = 7000
const SWIPE_THRESHOLD = 80

const BannerCarousel: React.FC = () => {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const index = ((page % BANNERS.length) + BANNERS.length) % BANNERS.length
  const banner = BANNERS[index]

  const paginate = useCallback((dir: number) => {
    setPage(([prev]) => [prev + dir, dir])
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const id = setInterval(() => paginate(1), AUTOPLAY_DELAY)
    return () => clearInterval(id)
  }, [isAutoPlaying, paginate])

  useEffect(() => {
    const img = new Image()
    img.src = BANNERS[(index + 1) % BANNERS.length].image
  }, [index])

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({
        x: dir > 0 ? 1000 : -1000,
        opacity: 0
      }),
      center: {
        x: 0,
        opacity: 1
      },
      exit: (dir: number) => ({
        x: dir < 0 ? 1000 : -1000,
        opacity: 0
      })
    }),
    []
  )

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x > SWIPE_THRESHOLD) paginate(-1)
            else if (info.offset.x < -SWIPE_THRESHOLD) paginate(1)
          }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner.image})` }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent md:bg-gradient-to-r md:from-slate-950/90 md:via-slate-950/60 md:to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-end md:justify-center pb-28 md:pb-0">
            <div className="max-w-xl space-y-6">
              <span className="inline-flex px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20 w-fit">
                Featured
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-7xl font-black leading-tight">
                {banner.title}
              </h2>

              <p className="text-base sm:text-lg md:text-2xl text-slate-200 leading-relaxed">
                {banner.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold">
                  {banner.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button className="px-6 py-3 rounded-full font-semibold text-white border border-white/30">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Controls Only */}
      <div className="hidden md:block">
        <button
          onClick={() => paginate(-1)}
          className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center bg-gradient-to-r from-black/40 to-transparent"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <button
          onClick={() => paginate(1)}
          className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center bg-gradient-to-l from-black/40 to-transparent"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {BANNERS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              index === i ? 'w-10 bg-white' : 'w-5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default BannerCarousel
