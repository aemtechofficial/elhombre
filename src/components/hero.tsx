"use client";

import Magnetic from "@/components/magnetic";
import Stars from "@/components/stars";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type HeroSettings = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string;
  cta2Href: string;
  image: string;
  season: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero({ s }: { s: HeroSettings }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);

  return (
    <section
      ref={ref}
      className="relative min-h-[92svh] flex flex-col justify-between overflow-hidden px-4 sm:px-8 pt-8 pb-6"
    >
      {/* top meta row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.8, ease: EASE }}
        className="flex items-center justify-between label-mono text-coal/70"
      >
        <span>{s.eyebrow}</span>
        <span className="hidden sm:block">{s.season}</span>
        <span className="hidden md:block">EST. MMXXV</span>
      </motion.div>

      {/* main */}
      <div className="relative grid lg:grid-cols-12 gap-8 items-end flex-1 py-10">
        <motion.div style={{ y: textY }} className="lg:col-span-8 relative z-10">
          <h1 className="font-display font-black tracking-[-0.045em] leading-[0.85] text-[clamp(3.4rem,13vw,11.5rem)]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35, duration: 1, ease: EASE }}
              >
                {s.titleLine1}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block text-outline"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.45, duration: 1, ease: EASE }}
              >
                {s.titleLine2}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.55, duration: 1, ease: EASE }}
              >
                {s.titleLine3}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease: EASE }}
            className="mt-7 max-w-md text-sm sm:text-[15px] leading-relaxed text-coal/80"
          >
            {s.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Link href={s.ctaHref} className="btn-block btn-dark">
                {s.ctaLabel} <ArrowRight size={16} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={s.cta2Href} className="btn-block btn-ghost text-ink">
                {s.cta2Label}
              </Link>
            </Magnetic>
          </motion.div>

          {/* trust row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            <span className="flex items-center gap-2">
              <Stars rating={5} size={13} />
              <span className="label-mono text-coal/80">
                4.9/5 · RATED BY 2,300+ MEN
              </span>
            </span>
            <span className="hidden sm:block w-px h-3.5 bg-ink/20" />
            <span className="label-mono text-coal/80">COD NATIONWIDE</span>
          </motion.div>
        </motion.div>

        {/* hero image */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ delay: 0.5, duration: 1.2, ease: EASE }}
          className="lg:col-span-4 relative aspect-[4/5] w-full max-w-sm lg:max-w-none overflow-hidden"
        >
          {/* gold glow over bottle */}
          <div className="absolute inset-0 glow-gold z-[1] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
            className="absolute top-3 left-3 z-10 label-mono bg-gold text-paper px-3 py-2"
          >
            N°01 · BESTSELLER
          </motion.div>
          <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
            <Image
              src={s.image}
              alt="EL HOMBRE · black monolith perfume flacon in cinematic monochrome light"
              fill
              priority
              className="object-cover img-bw"
              sizes="(max-width: 1024px) 90vw, 34vw"
            />
          </motion.div>
          <div className="absolute bottom-3 left-3 label-mono text-paper mix-blend-difference">
            N°01 · {s.season}
          </div>
        </motion.div>
      </div>

      {/* bottom row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.9 }}
        className="flex items-center justify-between label-mono text-coal/70"
      >
        <span className="flex items-center gap-2">
          <ArrowDown size={14} className="animate-bounce" /> SCROLL TO EXPLORE
        </span>
        <span className="hidden sm:block">N°004 · NUMBERED BATCH</span>
      </motion.div>
    </section>
  );
}
