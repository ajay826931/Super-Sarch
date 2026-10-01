"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Search, 
  Store, 
  Menu, 
  X, 
  MapPin, 
  PlusCircle,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If on admin routes, keep admin clean
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-teal-600 transition-colors">
                  KHM
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-600 -mt-1">
                  Kota Hostels & Mess
                </span>
              </div>
            </Link>

            {/* City Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              <span>Kota, Rajasthan</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "text-teal-700 bg-teal-50/70" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/search") 
                  ? "text-teal-700 bg-teal-50/70" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Explore Stays
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/vendor/login">
              <Button 
                variant="ghost" 
                size="sm"
                className={`font-semibold text-sm ${
                  pathname === "/vendor/login" ? "text-teal-700 bg-teal-50" : "text-gray-700 hover:text-teal-700"
                }`}
              >
                <Store className="h-4 w-4 mr-1.5 text-gray-500" />
                Vendor Login
              </Button>
            </Link>

            <Link href="/vendor/register">
              <Button 
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm rounded-xl px-4"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                List Your Property
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/vendor/login">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold">
                Vendor
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg">
            <MapPin className="h-3.5 w-3.5" />
            <span>Kota Student Accommodation Portal</span>
          </div>

          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === "/" ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith("/search") ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Search className="h-4 w-4" />
              Search Hostels & Messes
            </Link>
            <Link
              href="/vendor/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === "/vendor/login" ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Store className="h-4 w-4" />
              Vendor Login
            </Link>
          </nav>

          <div className="pt-2 border-t border-gray-100">
            <Link href="/vendor/register" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl h-11">
                <PlusCircle className="h-4 w-4 mr-2" />
                List Your Property (Free)
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
