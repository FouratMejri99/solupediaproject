import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
} from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

function Footer() {
  const [email, setEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch services from database with refresh key
  const servicesQuery = trpc.services.list.useQuery() as any;
  const dbServices = servicesQuery?.data || [];

  // Refresh data when page becomes visible (e.g., after admin update)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        setRefreshKey(k => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Filter to show only published services (handle both camelCase and lowercase)
  const publishedServices = dbServices.filter(
    (service: any) =>
      service.isPublished !== false && service.ispublished !== false
  );

  const subscribeNewsletter = trpc.leads.subscribeNewsletter.useMutation({
    onSuccess: () => {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to subscribe. Please try again in a moment."
      );
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeNewsletter.mutate({ email, type: "newsletter" });
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-16 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Company Info - spans 2 columns */}
          <div className="lg:col-span-2">
            <Link href="/">
              <img
                src="/logo-white-full.png"
                alt="Solupedia"
                className="h-8 mb-4 cursor-pointer"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-sm">
              Professional localization solutions for global businesses.
              Bridging language gaps since 2006 with expertise, technology, and
              a human touch.
            </p>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h4 className="font-semibold mb-2 text-sm">Subscribe</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-full h-8 text-sm"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={(subscribeNewsletter as any).isLoading}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 h-8 w-8"
                >
                  <ArrowRight size={18} />
                </Button>
              </form>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-base">
              Services
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              {publishedServices.length > 0 ? (
                publishedServices.map((service: any) => (
                  <li key={service.slug || service.id}>
                    <Link href={`/services/${service.slug}`}>
                      <a className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        {service.name}
                      </a>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-500">
                  No services published yet.
                </li>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-base">
              Resources
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/case-studies">
                  <a className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Case Studies
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/lead-magnet">
                  <a className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Free Guide
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    About Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-base">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Phone size={12} />
                </div>
                <a
                  href="tel:+2001555335577"
                  className="hover:text-white transition py-1"
                >
                  +20 01555335577
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Mail size={12} />
                </div>
                <a
                  href="mailto:info@solupedia.com"
                  className="hover:text-white transition py-1"
                >
                  info@solupedia.com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <MapPin size={12} />
                </div>
                <span className="py-1">
                  71-75 Shelton Street
                  <br />
                  Covent Garden, London
                  <br />
                  WC2H 9JQ, UK
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © 2026 Solupedia LTD. All rights reserved.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/solupediadotcom/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://wa.me/201555335577"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href="https://twitter.com/solupedia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all duration-300"
              >
                <Twitter size={14} />
              </a>
              <a
                href="https://linkedin.com/company/solupedia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white transition-all duration-300"
              >
                <Linkedin size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
