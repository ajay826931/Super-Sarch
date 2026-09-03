import DualSearchBar from "@/components/DualSearchBar";
import QuickCategories from "@/components/QuickCategories";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-600 to-teal-800 pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Find your perfect stay in Kota
          </h1>
          <p className="text-lg sm:text-xl text-teal-100 font-medium mb-10 max-w-xl mx-auto">
            Focus on studies, not distances. Discover the best Hostels, PGs, and Messes near your coaching.
          </p>
          
          {/* Main Search Component */}
          <div className="w-full max-w-md mx-auto">
            <DualSearchBar />
          </div>

          {/* Quick Categories Component */}
          <div className="w-full max-w-xl mx-auto">
            <QuickCategories />
          </div>
        </div>
      </section>

      {/* Featured/Info Section (Placeholder for future) */}
      <section className="py-16 px-4 bg-white flex-1">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why choose us?</h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            We provide verified listings, transparent pricing, and accurate distance tracking so you can make the best choice for your stay.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Verified Hostels</h3>
              <p className="text-sm text-gray-500">Every property is personally verified by our team.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Walking Distances</h3>
              <p className="text-sm text-gray-500">Know exactly how far you need to walk to your classes.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Best Pricing</h3>
              <p className="text-sm text-gray-500">Transparent pricing with zero hidden fees.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
