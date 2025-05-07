import { Facebook, Globe, Instagram } from "lucide-react"

export function Footer() {
  return (
      <footer className="p-4 text-center text-[#BABABA] mt-auto py-12">
      <div className="flex justify-center space-x-2 mb-2">
        <a href="#" className="text-[#BABABA] hover:text-white">
          <Globe className="w-5 h-5" />
        </a>
        <a href="#" className="text-[#BABABA] hover:text-white">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="#" className="text-[#BABABA] hover:text-white">
          <Facebook className="w-5 h-5" />
        </a>
      </div>
      <p className="text-sm">A HIGHSCHOOL EVENT BY @YMFGAKL</p>
    </footer>
  )
} 