"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 🌌 In a parallel universe, this code is written in Klingon
export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-between text-white font-sans">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full relative h-[420px] sm:h-[620px] flex items-end justify-center"
      >
        <Image
          src="/landing.png"
          alt="YTHWKND and the Multiverse of Mystery Poster"
          fill
          className="object-cover object-top opacity-90"
          quality={100}
          priority
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute w-full flex flex-col items-center pb-8 px-8 bg-gradient-to-t from-black/90 to-transparent"
        >
          <Image src="/assets/masthead.svg" className='sm:-mb-36 -mb-10' alt="YTHWKND and the Multiverse of Mystery Logo" width={700} height={700} />
        </motion.div>
      </motion.section>

      {/* Event Details */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full max-w-xl flex flex-col items-center px-6 py-8 z-10 mt-16 sm:mt-36"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-rumble tracking-wide text-[#bababa] uppercase">27 to 29 June</div>
          <div className="border-t border-gray-500 w-24 mx-auto my-6" />
          <div className="text-4xl md:text-5xl font-rumble tracking-wide text-[#bababa] uppercase leading-none">
            Bayu Beach Resort<br />Port Dickson
          </div>
        </motion.div>
        <div className="border-t border-gray-500 w-24 mx-auto my-6" />
        {/* Pricing */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col gap-4 text-center w-full"
        >
          {[
            { price: "RM250", label1: "NEW", label2: "FRIENDS" },
            { price: "RM300", label1: "YM", label2: "MEMBER" },
            { price: "RM550", label1: "DOUBLE", label2: "TICKET*" }
          ].map((item, index) => (
            <motion.div
              key={item.price}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-4xl md:text-5xl font-rumble text-[#bababa]">{item.price}</span>
              <div className="flex flex-col text-start leading-none">
                <span className="text-lg text-[#bababa] leading-none">{item.label1}</span>
                <span className="text-lg text-[#bababa] leading-none">{item.label2}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-center text-sm text-[#bababa] mt-10 uppercase"
        >
          *Must consist of one YM member and one new friend
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.7 }}
          className="text-center text-sm text-[#bababa] mt-8 uppercase"
        >
          **For non-Muslims only
        </motion.div>
        {/* Register Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-8"
        >
          <Button
            asChild
            className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble"
          >
            <Link href="/register">Register</Link>
          </Button>
        </motion.div>
      </motion.section>
    </main>
  );
}
