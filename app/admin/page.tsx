"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  // For now, redirecting to leads to save time or you can build a full dashboard here
  useEffect(() => {
    // We will just redirect to leads as it is the main CRM page
    router.replace("/admin/leads");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading Dashboard...</p>
      </div>
    </div>
  );
}
