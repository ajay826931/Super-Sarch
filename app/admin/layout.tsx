import Link from "next/link";
import { Users, LayoutDashboard, Building, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">KHM<span className="text-blue-500">Admin</span></h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin God Mode</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/leads" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Users className="h-5 w-5 mr-3" />
            Leads CRM
          </Link>
          <Link href="/admin/vendors" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Building className="h-5 w-5 mr-3" />
            Vendor Approvals
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Command Center</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
