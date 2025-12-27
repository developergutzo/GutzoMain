import { Instagram, Facebook } from "lucide-react";
import { useRouter } from "./Router";
import { ImageWithFallback } from "./common/ImageWithFallback";

export function Footer() {
  const { navigate } = useRouter();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-start justify-between gap-8 sm:gap-12 lg:gap-16 mt-8 sm:mt-12 lg:mt-16 pb-24 sm:pb-32 lg:pb-40">
          
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[280px] lg:flex-shrink-0">
            <button
              type="button"
              aria-label="Go to homepage"
              onClick={() => navigate('/')}
              className="p-0 bg-transparent border-0 inline-flex items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform interactive mb-3 sm:mb-4"
            >
              <ImageWithFallback
                src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                //src="http://192.168.1.39:54321/storage/v1/object/public/Gutzo/GUTZO.svg"
                //src="https://jrpiqxajjpyxiitweoqc.supabase.co/storage/v1/object/public/Gutzo%20Logo/GUTZO.svg"
                alt="Gutzo - Food You'll Eat Again"
                className="h-12 sm:h-14 lg:h-16 w-auto"
              />
            </button>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting you with the best daily kitchens in Coimbatore.
            </p>
          </div>
          
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:flex-1">
            <h3 className="font-medium text-white mb-3 sm:mb-4 text-base">Company</h3>
            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={() => navigate('/about')}
                className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
              >
                About Us
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
              >
                Contact Us
              </button>
            </div>
          </div>
          
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:flex-1">
             <h3 className="font-medium text-white mb-3 sm:mb-4 text-base">For Kitchens</h3>
             <div className="space-y-2 sm:space-y-3">
               <button 
                 onClick={() => navigate('/partner-with-gutzo')}
                 className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
               >
                 Partner with Gutzo
               </button>
               <button 
                 onClick={() => navigate('/partner/login')}
                 className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
               >
                 Partner Login
               </button>
             </div>
           </div>

          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:flex-1">
            <h3 className="font-medium text-white mb-3 sm:mb-4 text-base">Legal</h3>
            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={() => navigate('/T&C')}
                className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
              >
                Terms & Conditions
              </button>
              <button 
                onClick={() => navigate('/refund_policy')}
                className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
              >
                Refund Policy
              </button>
              <button 
                onClick={() => navigate('/privacy_policy')}
                className="block text-gray-400 hover:text-white transition-colors text-sm text-left whitespace-nowrap interactive font-normal"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          
          <div className="w-full sm:w-[calc(50%-1.5rem)] lg:w-auto lg:flex-1">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-base">Follow Us</h3>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://www.instagram.com/gutzo.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 p-0 interactive group focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer inline-flex"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ease-out group-hover:bg-white/10">
                  <Instagram className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-105 group-hover:brightness-125" />
                </div>
                <span className="sr-only">Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/gutzo.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 p-0 interactive group focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer inline-flex"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ease-out group-hover:bg-white/10">
                  <Facebook className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-105 group-hover:brightness-125" />
                </div>
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
        </div>
        
  <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 sm:pt-12 lg:pt-16 mt-6 sm:mt-8 lg:mt-10">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2025 Gutzo. All rights reserved.
            </p>
            {/* Footer links removed as requested */}
          </div>
        </div>
      </div>
    </footer>
  );
}