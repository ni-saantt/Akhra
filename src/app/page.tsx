import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Smart Farming Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Digitize your farm, monitor soil health, irrigation and crop advisory.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-3">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features designed for you
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-4">🗺</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Farm Mapping</h3>
              <p className="text-gray-600 leading-relaxed">
                Draw your farm boundary on a map with precision.
              </p>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Soil Health</h3>
              <p className="text-gray-600 leading-relaxed">
                Analyze soil pH and nutrients effortlessly.
              </p>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-4">☁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Weather Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Get vital rain and irrigation notifications.
              </p>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Crop Advisory</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive AI-based agricultural recommendations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Start managing your farm digitally.</h2>
        <Link href="/register">
          <button className="bg-white text-green-700 font-bold text-lg px-8 py-4 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
            Register Your Farm
          </button>
        </Link>
      </section>
    </div>
  );
}
