import Link from "next/link";
import { Store, LogOut, Home, IndianRupee } from "lucide-react";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Mobile Header (visible only on mobile) */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center text-primary font-bold text-lg">
          <Store className="mr-2 h-5 w-5" />
          Vendor Portal
        </div>
        <Link href="/vendor/login" className="text-gray-500 hover:text-red-600">
          <LogOut className="h-5 w-5" />
        </Link>
      </div>

      {/* Sidebar (desktop) / Bottom Nav (mobile) */}
      <aside className="fixed bottom-0 w-full md:relative md:w-64 bg-white border-t md:border-r md:border-t-0 z-40">
        <div className="hidden md:flex items-center p-6 border-b text-primary font-bold text-xl">
          <Store className="mr-3 h-6 w-6" />
          Vendor Portal
        </div>
        
        <nav className="flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-2">
          <Link 
            href="/vendor/dashboard" 
            className="flex flex-col md:flex-row items-center p-3 text-sm md:text-base font-medium rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition flex-1 md:flex-none text-center md:text-left"
          >
            <Home className="h-5 w-5 md:mr-3 mb-1 md:mb-0" />
            My Property
          </Link>
          
          <Link 
            href="/vendor/dashboard" 
            className="flex flex-col md:flex-row items-center p-3 text-sm md:text-base font-medium rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition flex-1 md:flex-none text-center md:text-left"
          >
            <IndianRupee className="h-5 w-5 md:mr-3 mb-1 md:mb-0" />
            Update Rent
          </Link>
          
          <Link 
            href="/vendor/login" 
            className="hidden md:flex items-center p-3 text-sm md:text-base font-medium rounded-lg text-red-600 hover:bg-red-50 mt-auto"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
