"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Heart,
  Store,
  Search
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  KHM
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-400 -mt-1">
                  Kota Hostels & Mess
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Kota&apos;s dedicated accommodation search platform. Helping students and parents find verified Hostels, PGs, and Messes near top coaching institutes with transparent pricing.
            </p>

            <div className="flex items-center gap-2 text-xs text-teal-400 bg-slate-800/80 px-3 py-1.5 rounded-lg w-fit border border-slate-700/60">
              <MapPin className="h-3.5 w-3.5" />
              <span>Landmark City, Kunhari, Jawahar Nagar, Kota</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Kota Stays
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?q2=Hostel" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>Student Hostels</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q2=PG" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>Paying Guest (PG)</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q2=Mess" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>Food & Tiffin Mess</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q2=Library" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>24x7 Study Libraries</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-teal-400" />
                  <span>Search All Properties</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Property Owners / Vendors */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Property Owners
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/vendor/register" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>List Your Hostel or Mess (Free)</span>
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-teal-400" />
                  <span>Vendor Portal Login</span>
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>Manage Room Rates & Photos</span>
                </Link>
              </li>
              <li className="pt-2">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-teal-400 font-semibold mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Listings
                  </div>
                  Zero brokerage from students. Direct genuine inquiries for vendors.
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Help & Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                <span>support@khm.in</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                <span>+91 82693 13480</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Kota, Rajasthan 324005</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Are you a coaching student? Contact us for free room recommendations.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} KHM (Kota Hostels & Mess). All rights reserved.
          </p>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>for Kota Students & Vendors</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
