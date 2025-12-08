"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import Button from "./components/ui/Button";
import { Star } from "lucide-react";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Just mocking logic: split data for demo (latest 4 for new arrivals, next 4 for top selling)
        if (Array.isArray(data)) {
          setNewArrivals(data.slice(0, 4));
          setTopSelling(data.slice(0, 4)); // In reality, we'd have different queries or logic
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    }
    fetchData();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-shop-gray-200 pt-[50px] md:pt-20">
        <div className="container flex flex-wrap items-center justify-between">
          <div className="flex-1 min-w-[300px] pb-[50px]">
            <h1 className="text-[40px] md:text-[64px] font-black leading-none mb-8 font-sans">
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-base text-shop-gray-500 mb-8 max-w-[545px]">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>
            <Button size="lg" className="w-full md:w-auto">Shop Now</Button>

            <div className="flex gap-8 mt-12 flex-wrap">
              <div>
                <h3 className="text-[40px] font-bold">200+</h3>
                <p className="text-sm md:text-base text-shop-gray-500">International Brands</p>
              </div>
              <div className="w-px bg-shop-border hidden md:block"></div>
              <div>
                <h3 className="text-[40px] font-bold">2,000+</h3>
                <p className="text-sm md:text-base text-shop-gray-500">High-Quality Products</p>
              </div>
              <div className="w-px bg-shop-border hidden md:block"></div>
              <div>
                <h3 className="text-[40px] font-bold">30,000+</h3>
                <p className="text-sm md:text-base text-shop-gray-500">Happy Customers</p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] relative h-[400px] md:h-[663px]">
            {/* Decorative Stars */}
            <Star className="absolute top-[50px] right-[20px] text-black w-10 h-10 md:w-14 md:h-14 fill-black" />
            <Star className="absolute top-[40%] left-0 text-black w-6 h-6 md:w-11 md:h-11 fill-black" />

            {/* Hero Image */}
            <div className="relative w-full h-full min-h-[400px] rounded-[20px] overflow-hidden">
              <Image
                src="/hero.png"
                alt="Fashion Heros"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brands Banner */}
      <section className="bg-black py-10">
        <div className="container flex justify-center md:justify-between items-center gap-8 flex-wrap">
          {/* Using simple text for brands for now */}
          <span className="brand-text">VERSACE</span>
          <span className="brand-text">ZARA</span>
          <span className="brand-text">GUCCI</span>
          <span className="brand-text">PRADA</span>
          <span className="brand-text">Calvin Klein</span>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-[72px] border-b border-shop-border" id="new-arrivals">
        <h2 className="text-center text-[32px] md:text-[48px] font-black mb-14 font-sans uppercase">NEW ARRIVALS</h2>
        <div className="flex gap-5 overflow-x-auto pb-5 md:grid md:grid-cols-4 md:overflow-visible no-scrollbar">
          {newArrivals.map(product => (
            <div key={product.id} className="min-w-[198px]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
        <div className="text-center mt-9">
          <Link href="/shop"><Button variant="secondary" className="px-[54px] py-4 w-full md:w-auto">View All</Button></Link>
        </div>
      </section>

      {/* Top Selling */}
      <section className="container py-[72px]" id="on-sale">
        <h2 className="text-center text-[32px] md:text-[48px] font-black mb-14 font-sans uppercase">TOP SELLING</h2>
        <div className="flex gap-5 overflow-x-auto pb-5 md:grid md:grid-cols-4 md:overflow-visible no-scrollbar">
          {topSelling.map(product => (
            <div key={product.id} className="min-w-[198px]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
        <div className="text-center mt-9">
          <Link href="/shop"><Button variant="secondary" className="px-[54px] py-4 w-full md:w-auto">View All</Button></Link>
        </div>
      </section>

      {/* Browse by Style */}
      <section className="container pb-20">
        <div className="bg-[#F0F0F0] rounded-[40px] py-[70px] px-6 md:px-16">
          <h2 className="text-center text-[32px] md:text-[48px] font-black mb-16 font-sans uppercase">BROWSE BY DRESS STYLE</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[289px]">
            <StyleCard title="Casual" span="md:col-span-5" img="/casual.png" />
            <StyleCard title="Formal" span="md:col-span-7" img="/formal.png" />
            <StyleCard title="Party" span="md:col-span-7" img="/party.png" />
            <StyleCard title="Gym" span="md:col-span-5" img="/gym.png" />
          </div>
        </div>
      </section>


      {/* Happy Customers */}
      <section className="container py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-[32px] md:text-[48px] font-black font-sans uppercase leading-none">OUR HAPPY CUSTOMERS</h2>
          <div className="flex gap-2.5">
            {/* Arrows */}
            <Button variant="secondary" className="p-2.5"><span className="text-xl">←</span></Button>
            <Button variant="secondary" className="p-2.5"><span className="text-xl">→</span></Button>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-5 no-scrollbar">
          {TESTIMONIALS.map(t => (
            <div key={t.id} className="min-w-[300px] md:min-w-[400px] border border-shop-border rounded-[20px] p-7 flex flex-col gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} className="fill-[#FFC633] text-[#FFC633]" />
                ))}
              </div>
              <h4 className="text-xl font-bold flex items-center gap-1.5">
                {t.name} <div className="bg-[#01AB31] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✓</div>
              </h4>
              <p className="text-shop-gray-500 leading-[22px]">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const StyleCard = ({ title, span, img }: { title: string, span: string, img: string }) => (
  <div className={`${span} col-span-1 bg-white rounded-[20px] p-6 relative overflow-hidden bg-cover bg-center min-h-[190px]`}
    style={{ backgroundImage: `url(${img})` }}> {/* Keeping inline bg image as it's dynamic */}
    <h3 className="text-4xl font-bold">{title}</h3>
  </div>
);

// Still using static testimonials, could move to DB later
const TESTIMONIALS = [
  { id: 1, name: "Sarah M.", text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations." },
  { id: 2, name: "Alex K.", text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions." },
  { id: 3, name: "James L.", text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends." },
];
