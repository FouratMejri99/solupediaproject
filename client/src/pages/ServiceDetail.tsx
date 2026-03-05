import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { serviceLayoutsService } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
} from "lucide-react";
import { Link, useRoute } from "wouter";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";

  const queryResult = trpc.services.getBySlug.useQuery(slug) as any;
  const dbService = queryResult?.data;
  const isLoading = queryResult?.isLoading;
  const refetch = queryResult?.refetch;

  // Fetch service layouts
  const [layouts, setLayouts] = useState<any[]>([]);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);

  useEffect(() => {
    const fetchLayouts = async () => {
      if (dbService?.id) {
        setIsLoadingLayouts(true);
        try {
          const result = await serviceLayoutsService.getByServiceId(dbService.id);
          setLayouts(result || []);
        } catch (error) {
          console.error("Error fetching layouts:", error);
        } finally {
          setIsLoadingLayouts(false);
        }
      }
    };
    fetchLayouts();
  }, [dbService?.id]);

  // Group layouts by section
  const sections = layouts.reduce((acc: any[], layout: any) => {
    const sectionKey = layout.section_title || 'default';
    const existingSection = acc.find(s => s.sectionTitle === sectionKey);
    if (existingSection) {
      existingSection.items.push(layout);
    } else {
      acc.push({
        sectionTitle: sectionKey,
        layoutType: layout.layout_type || 1,
        items: [layout]
      });
    }
    return acc;
  }, []);

  // Refresh when tab becomes active
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading service...</p>
      </div>
    );
  }

  // 404 state
  if (!dbService) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 text-gray-900">404</h1>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Service Not Found
          </h2>
          <Link href="/services">
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2" size={18} /> Back to Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Normalize features & process
  const benefits =
    typeof dbService.keyfeatures === "string"
      ? dbService.keyfeatures.split("\n").filter((f: string) => f.trim())
      : dbService.keyfeatures || [];

  const process = (() => {
    if (typeof dbService.processsteps === "string" && dbService.processsteps.includes('|')) {
      // Parse pipe-separated format: step|title|description
      const steps = dbService.processsteps.split('|');
      const parsed: string[] = [];
      for (let i = 2; i < steps.length; i += 3) {
        if (steps[i]?.trim()) parsed.push(steps[i].trim());
      }
      return parsed;
    }
    // Fallback to newline-separated
    return typeof dbService.processsteps === "string"
      ? dbService.processsteps.split("\n").filter((s: string) => s.trim())
      : dbService.processsteps || [];
  })();

  return (
    <div className="w-full relative overflow-hidden bg-white">
      {/* HERO */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative pt-32 pb-20 z-10"
      >
        <div className="container mx-auto px-4">
          <Link href="/services">
            <Button variant="ghost" className="mb-8 text-blue-600">
              <ArrowLeft className="mr-2" size={18} /> Back to Services
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-blue-900">
                {dbService.name}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {dbService.shortDescription}
              </p>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 h-12">
                  Get Started <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video">
              <img
                src={dbService.image}
                alt={dbService.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* CONTENT */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col space-y-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                {dbService.description}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8">Key Benefits</h2>
              <div className="space-y-4">
                {benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle className="text-blue-600 mt-1" size={20} />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Layout Sections */}
            {sections.map((section: any, sectionIdx: number) => (
              <div key={sectionIdx} className="flex flex-col items-center">
                {section.sectionTitle && section.sectionTitle !== 'default' && (
                  <h2 className="text-3xl font-bold mb-8 text-center">{section.sectionTitle}</h2>
                )}
                
                <div className="w-full">
                
                {/* Layout Type 1: Numbered items with cards (flexible per line) */}
{section.layoutType === 1 && (
  <div className="relative py-10">

    {/* Connecting Line (Desktop) */}
    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -translate-y-1/2 z-0" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
      {section.items.map((item: any, idx: number) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="text-center flex flex-col items-center"
        >
          {/* Circle Step */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {item.item_number || idx + 1}
            </div>

            {/* Arrow Between Steps */}
            {idx !== section.items.length - 1 && (
              <ArrowRight className="hidden lg:block absolute -right-14 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.item_title}
          </h3>

          {/* Description */}
          {item.item_description && (
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {item.item_description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  </div>
)}

                {/* Layout Type 2: Simple list - Modern grid cards */}
                {section.layoutType === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                            {item.item_number || idx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{item.item_title}</h3>
                            {item.item_description && (
                              <p className="text-gray-600 mt-1 text-sm">{item.item_description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Layout Type 3: With sub-items - Same as Type 2 */}
                {section.layoutType === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item: any, idx: number) => {
                      const subItems = typeof item.sub_items === 'string' ? JSON.parse(item.sub_items) : (item.sub_items || []);
                      return (
                        <div key={idx} className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="text-blue-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">{item.item_title}</h3>
                              {subItems.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {subItems.map((sub: string, subIdx: number) => (
                                    <li key={subIdx} className="text-gray-600 text-sm flex items-center gap-2">
                                      <span className="text-blue-500">•</span>
                                      {sub}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Layout Type 4: Iconized with sub-items - Modern cards with icons */}
                {section.layoutType === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.items.map((item: any, idx: number) => {
                      const subItems = typeof item.sub_items === 'string' ? JSON.parse(item.sub_items) : (item.sub_items || []);
                      return (
                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="text-white" size={24} />
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-gray-900">{item.item_title}</h3>
                                {item.item_description && (
                                  <p className="text-gray-500 text-sm">{item.item_description}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2 pl-15">
                              {subItems.map((sub: string, subIdx: number) => (
                                <div key={subIdx} className="flex items-center gap-2 text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                  <span>{sub}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
{/* Sidebar */}
{/* SIDEBAR */}
<div className="lg:col-span-1">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="sticky top-20 self-start space-y-8"
  >
    {/* Main CTA Card */}
    <Card className="rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Start Your Project
        </h3>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Ready to elevate your{" "}
          <span className="font-semibold text-blue-600">{dbService.name}</span>?
          Let’s build something exceptional together.
        </p>

        <Link href="/contact">
          <Button className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition">
            Request a Quote
          </Button>
        </Link>

        <p className="text-xs text-gray-500 text-center mt-4">
          Free consultation • No commitment
        </p>
      </CardContent>
    </Card>

    {/* Why Choose Us Card */}
    <Card className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-8 space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">
          Why Choose Us?
        </h4>

        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">18+ Years Experience</p>
              <p className="text-xs text-gray-500">
                Proven expertise across industries
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">7,000+ Projects</p>
              <p className="text-xs text-gray-500">
                Successfully delivered worldwide
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">150+ Languages</p>
              <p className="text-xs text-gray-500">Global communication support</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
</div>
        </div>
      </section>
    </div>
  );
}
