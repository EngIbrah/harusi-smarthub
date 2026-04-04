import Image from "next/image";
import Link from "next/link";
import { WEDDING_IMAGES } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left – form side */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-harusi-cream">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-lg shadow-lg">💍</div>
          <span className="font-serif text-2xl font-bold text-harusi-dark">
            Harusi <span className="text-gradient-gold">SmartHub</span>
          </span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
      {/* Right – photo side */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <Image
          src={WEDDING_IMAGES[0]}
          alt="Beautiful wedding"
          fill
          className="object-cover"
          sizes="45vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-harusi-darker/80 via-harusi-darker/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <blockquote className="font-serif text-2xl font-light italic leading-relaxed">
            "The beginning of a beautiful journey together."
          </blockquote>
          <p className="mt-3 text-stone-300 text-sm">Plan smarter. Celebrate bigger.</p>
        </div>
      </div>
    </div>
  );
}
