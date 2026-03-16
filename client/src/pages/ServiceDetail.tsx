import { Button } from "@/components/ui/button";
import { serviceLayoutsService } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";

  const queryResult = trpc.services.getBySlug.useQuery(slug) as any;
  const dbService = queryResult?.data;
  const isLoading = queryResult?.isLoading;

  const [layouts, setLayouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchLayouts = async () => {
      if (dbService?.id) {
        const result = await serviceLayoutsService.getByServiceId(dbService.id);
        setLayouts(result || []);
      }
    };
    fetchLayouts();
  }, [dbService?.id]);

  const sections = layouts.reduce((acc: any[], layout: any) => {
    const key = layout.section_title || "default";

    const existing = acc.find(s => s.sectionTitle === key);

    if (existing) {
      existing.items.push(layout);
    } else {
      acc.push({
        sectionTitle: key,
        layoutType: layout.layout_type || 1,
        items: [layout],
      });
    }

    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading service...</p>
      </div>
    );
  }

  if (!dbService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">Service not found</h1>
      </div>
    );
  }

  const benefits =
    typeof dbService.keyfeatures === "string"
      ? dbService.keyfeatures.split("\n").filter((f: string) => f.trim())
      : dbService.keyfeatures || [];

  return (
    <div className="w-full bg-white">
      {/* HERO */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4">
          <Link href="/services">
            <Button variant="ghost" className="mb-10 text-blue-600">
              <ArrowLeft className="mr-2" size={18} />
              Back to Services
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                {dbService.name}
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                {dbService.shortDescription}
              </p>

              <Link href="/contact">
                <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700">
                  Start Project
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={dbService.image}
                alt={dbService.name}
                className="w-full h-[380px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Service Overview</h2>

          <p className="text-gray-600 text-lg leading-relaxed">
            {dbService.description}
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-14">Key Benefits</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <CheckCircle className="text-blue-600 mt-1" />
                <p className="text-gray-700">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC SECTIONS */}
      {sections.map((section: any, sectionIdx: number) => (
        <section key={sectionIdx} className="py-20 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            {section.sectionTitle !== "default" && (
              <h2 className="text-4xl font-bold text-center mb-16">
                {section.sectionTitle}
              </h2>
            )}

            {/* LAYOUT 1 */}
            {section.layoutType === 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map((item: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white border rounded-xl p-6 text-center hover:shadow-lg transition"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                      {item.item_number || idx + 1}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">
                      {item.item_title}
                    </h3>

                    {item.item_description && (
                      <p className="text-gray-600 text-sm">
                        {item.item_description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* LAYOUT 2 FIXED */}
            {section.layoutType === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {section.items.map((item: any, idx: number) => {
                  const subItems =
                    typeof item.sub_items === "string"
                      ? JSON.parse(item.sub_items)
                      : item.sub_items || [];

                  return (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-5 hover:shadow-md transition"
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold">
                          {item.item_number || idx + 1}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.item_title}
                          </h3>

                          {item.item_description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {item.item_description}
                            </p>
                          )}

                          {subItems.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {subItems.map((sub: string, subIdx: number) => (
                                <li
                                  key={subIdx}
                                  className="text-gray-600 text-sm flex gap-2"
                                >
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

            {/* LAYOUT 3 */}
            {section.layoutType === 3 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item: any, idx: number) => {
                  const subItems =
                    typeof item.sub_items === "string"
                      ? JSON.parse(item.sub_items)
                      : item.sub_items || [];

                  return (
                    <div
                      key={idx}
                      className="flex gap-3 p-4 border rounded-xl bg-white hover:shadow-md transition"
                    >
                      <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" />

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.item_title}
                        </h3>

                        {item.item_description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {item.item_description}
                          </p>
                        )}

                        {subItems.length > 0 && (
                          <ul className="space-y-1">
                            {subItems.map((sub: string, subIdx: number) => (
                              <li
                                key={subIdx}
                                className="text-gray-600 text-sm flex gap-2"
                              >
                                <span className="text-blue-500">•</span>
                                {sub}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LAYOUT 4 */}
            {/* LAYOUT 4 - IMPROVED */}
            {/* LAYOUT 4 */}
            {section.layoutType === 4 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((item: any, idx: number) => {
                  const subItems =
                    typeof item.sub_items === "string"
                      ? JSON.parse(item.sub_items)
                      : item.sub_items || [];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white border rounded-2xl p-8 hover:shadow-xl transition"
                    >
                      {/* ICON + TITLE SAME LINE */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <CheckCircle size={20} />
                        </div>

                        <h3 className="font-bold text-lg text-gray-900">
                          {item.item_title}
                        </h3>
                      </div>

                      {item.item_description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {item.item_description}
                        </p>
                      )}

                      {subItems.length > 0 && (
                        <ul className="space-y-2">
                          {subItems.map((sub: string, subIdx: number) => (
                            <li
                              key={subIdx}
                              className="flex items-start gap-2 text-gray-600 text-sm"
                            >
                              <span className="text-blue-500">•</span>
                              {sub}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24 bg-blue-50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-6">Start Your Project</h3>

          <p className="text-gray-600 mb-10">
            Ready to build something great with our{" "}
            <span className="text-blue-600 font-semibold">
              {dbService.name}
            </span>{" "}
            service?
          </p>

          <Link href="/contact">
            <Button className="h-12 px-10 rounded-full bg-blue-600 hover:bg-blue-700">
              Request a Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h3 className="text-4xl font-bold text-center mb-16">
            Why Choose Us
          </h3>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div>
              <Calendar className="mx-auto text-blue-600 mb-4" size={32} />
              <p className="font-bold text-lg">18+ Years Experience</p>
              <p className="text-gray-500 text-sm">
                Proven expertise across industries
              </p>
            </div>

            <div>
              <FileText className="mx-auto text-blue-600 mb-4" size={32} />
              <p className="font-bold text-lg">7000+ Projects</p>
              <p className="text-gray-500 text-sm">
                Successfully delivered worldwide
              </p>
            </div>

            <div>
              <Globe className="mx-auto text-blue-600 mb-4" size={32} />
              <p className="font-bold text-lg">150+ Languages</p>
              <p className="text-gray-500 text-sm">
                Global communication support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
