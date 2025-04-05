import { Link } from "wouter";
import { Facebook, Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-lg font-semibold">AI & Blockchain Voting System</h2>
            <p className="mt-2 text-sm text-gray-400">Secure, transparent, and reliable electronic voting</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Resources</h3>
              <div className="mt-4 space-y-2">
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Help Center</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Privacy Policy</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Terms of Service</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Contact</h3>
              <div className="mt-4 space-y-2">
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Support</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Report Issues</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white block">Feedback</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} AI & Blockchain Voting System. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
