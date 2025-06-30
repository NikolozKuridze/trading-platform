import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          {children}
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Start Trading Today
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p>Access to 100+ cryptocurrency trading pairs</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p>Advanced trading tools and real-time market data</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p>Secure wallet with industry-leading protection</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p>24/7 customer support and educational resources</p>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Total Trading Volume</p>
                  <p className="text-2xl font-bold text-foreground">$2.8B+</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active Traders</p>
                  <p className="text-2xl font-bold text-foreground">500K+</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Countries</p>
                  <p className="text-2xl font-bold text-foreground">180+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}