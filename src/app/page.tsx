import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col pt-32">
      {/* Hero Background with Overlays */}
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/images/hero-bg.png"
          alt="Modern Farm Landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-green/60 via-deep-green/40 to-deep-green/80" />
      </div>

      {/* Hero Content */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-white text-xs font-black uppercase tracking-[0.3em] mb-4">
            Future of Agriculture
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            Smart Farming <br /> <span className="text-soft-green">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Digitize your farm, monitor soil health, irrigation and crop advisory with our industry-leading precision tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link href="/register">
              <Button variant="primary" className="w-full sm:w-auto text-xl px-12 py-5 rounded-3xl">
                Register Your Farm
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="glass" className="w-full sm:w-auto text-xl px-12 py-5 rounded-3xl text-white border-white/20">
                Farmer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 lg:px-20 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { tag: "01", icon: "🗺", title: "Farm Mapping", desc: "Draw your farm boundary on a high-res map." },
            { tag: "02", icon: "🌱", title: "Soil Health", desc: "Analyze soil pH and nutrients instantly." },
            { tag: "03", icon: "☁", title: "Weather Alerts", desc: "Get rain and irrigation notifications." },
            { tag: "04", icon: "📈", title: "Crop Advisory", desc: "AI-based recommendations for your yield." }
          ].map((feature, i) => (
            <Card key={i} variant="glass" className="group hover:-translate-y-2 hover:bg-white/20 transition-all duration-500 cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="text-5xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                <div className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{feature.tag}</div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-white/70 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Modern CTA */}
      <section className="relative py-24 px-6 text-center">
        <Card variant="glass-dark" className="max-w-4xl mx-auto py-16 px-8 border-white/10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Start managing your farm digitally today.</h2>
          <Link href="/register">
            <Button variant="primary" className="text-xl px-12 py-5 rounded-3xl mt-4">
              Get Started Now
            </Button>
          </Link>
        </Card>
      </section>

      <footer className="relative py-12 px-6 border-t border-white/10 text-center text-white/40 text-xs font-black uppercase tracking-[0.3em]">
        © 2026 AKHRA KISAN • Built for the modern farmer
      </footer>
    </div>
  );
}
