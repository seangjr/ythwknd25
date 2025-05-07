import { Facebook, Globe, Instagram } from "lucide-react"

// 🎮 Press Up, Up, Down, Down, Left, Right, Left, Right, B, A to unlock the secret level
export function Footer() {
  return (
      <footer className="p-4 text-center text-[#BABABA] mt-auto py-12">
      <div className="flex justify-center space-x-2 mb-2">
        <a href="https://ymfgakl.com" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <Globe className="w-5 h-5" />
        </a>
        <a href="https://www.instagram.com/ymfgakl" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://www.facebook.com/ymfgakl" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <Facebook className="w-5 h-5" />
        </a>
      </div>
      <p className="text-sm">A HIGHSCHOOL EVENT BY @YMFGAKL</p>
    </footer>
  )
} 