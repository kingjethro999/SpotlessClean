import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MobileNav } from '@/components/mobile-nav';
import { Shirt, Zap, MessageSquare, TrendingUp, Shield, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-4 relative">
          <div className="flex items-center gap-2 min-w-fit">
            <Logo size={24} className="md:size-8" />
            <span className="text-lg md:text-xl font-bold text-amber-900 whitespace-nowrap">SpotlessClean</span>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-4 text-balance">
            Professional Dry Cleaning Made Simple
          </h1>
          <p className="text-base md:text-lg text-amber-700 mb-8 max-w-2xl mx-auto text-pretty">
            Request cleaning services online, track your items in real-time, and enjoy convenient pickup. Professional care for your clothes, simplified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-amber-700 hover:bg-amber-800 w-full">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-16 border-t border-amber-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-900 text-center mb-8 md:mb-12">Why Choose SpotlessClean?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="p-4 md:p-6 rounded-lg border border-amber-200 bg-amber-50">
              <Shirt className="text-amber-700 mb-3" size={28} />
              <h3 className="font-semibold text-amber-900 mb-2 text-sm md:text-base">Easy Requests</h3>
              <p className="text-xs md:text-sm text-amber-700">
                Create cleaning requests with detailed item specifications and special instructions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 md:p-6 rounded-lg border border-amber-200 bg-amber-50">
              <Zap className="text-amber-700 mb-3" size={28} />
              <h3 className="font-semibold text-amber-900 mb-2 text-sm md:text-base">Real-Time Tracking</h3>
              <p className="text-xs md:text-sm text-amber-700">
                Monitor your request status from submission to pickup. Stay informed every step of the way.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 md:p-6 rounded-lg border border-amber-200 bg-amber-50">
              <MessageSquare className="text-amber-700 mb-3" size={28} />
              <h3 className="font-semibold text-amber-900 mb-2 text-sm md:text-base">Direct Messaging</h3>
              <p className="text-xs md:text-sm text-amber-700">
                Communicate directly with our team about your items or any special requests.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-4 md:p-6 rounded-lg border border-amber-200 bg-amber-50">
              <TrendingUp className="text-amber-700 mb-3" size={28} />
              <h3 className="font-semibold text-amber-900 mb-2 text-sm md:text-base">Transparent Pricing</h3>
              <p className="text-xs md:text-sm text-amber-700">
                Know exactly what you'll pay before confirming. No hidden charges or surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 border-t border-amber-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-900 text-center mb-8 md:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg mb-4">1</div>
              <h3 className="font-semibold text-amber-900 mb-2">Create Account</h3>
              <p className="text-sm text-amber-700">Sign up with your email and address to get started in minutes.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg mb-4">2</div>
              <h3 className="font-semibold text-amber-900 mb-2">Submit Request</h3>
              <p className="text-sm text-amber-700">Detail your items, add special instructions, and receive instant pricing.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg mb-4">3</div>
              <h3 className="font-semibold text-amber-900 mb-2">We Collect & Clean</h3>
              <p className="text-sm text-amber-700">We pick up your items and professionally handle them with care.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg mb-4">4</div>
              <h3 className="font-semibold text-amber-900 mb-2">Ready for Pickup</h3>
              <p className="text-sm text-amber-700">Receive notification when ready, pay face-to-face, and collect your cleaned items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 border-t border-amber-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-900 text-center mb-8 md:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group border border-amber-200 rounded-lg p-4 md:p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-amber-900 group-open:text-amber-700">
                What items can I send for cleaning?
                <span className="text-xl">+</span>
              </summary>
              <p className="text-sm text-amber-700 mt-4">
                We clean shirts, trousers, dresses, suits, jackets, coats, and most delicate fabrics. Just specify any special care instructions when submitting your request.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group border border-amber-200 rounded-lg p-4 md:p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-amber-900 group-open:text-amber-700">
                How long does cleaning take?
                <span className="text-xl">+</span>
              </summary>
              <p className="text-sm text-amber-700 mt-4">
                Standard turnaround is 5-7 business days. Express services may be available for rush orders. Track your items in real-time in your dashboard.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group border border-amber-200 rounded-lg p-4 md:p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-amber-900 group-open:text-amber-700">
                How do I pay?
                <span className="text-xl">+</span>
              </summary>
              <p className="text-sm text-amber-700 mt-4">
                Payment is simple and flexible. Pay via bank transfer or cash upon pickup. We provide transparent pricing upfront, so no surprises.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group border border-amber-200 rounded-lg p-4 md:p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-amber-900 group-open:text-amber-700">
                What if I'm not satisfied with the service?
                <span className="text-xl">+</span>
              </summary>
              <p className="text-sm text-amber-700 mt-4">
                We guarantee 100% satisfaction with our cleaning quality. If you have any concerns, contact our support team immediately for resolution.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group border border-amber-200 rounded-lg p-4 md:p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-semibold text-amber-900 group-open:text-amber-700">
                Can I communicate with the cleaning staff?
                <span className="text-xl">+</span>
              </summary>
              <p className="text-sm text-amber-700 mt-4">
                Yes! Use our built-in messaging feature to communicate directly with our team about special instructions, concerns, or questions about your items.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-700 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to simplify your laundry?</h2>
          <p className="text-base md:text-lg text-amber-100 mb-8">
            Join hundreds of satisfied customers who trust SpotlessClean with their garments.
          </p>
          <Link href="/auth/register" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 w-full">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-amber-200">© 2025 SpotlessClean. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
