import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Icon map (since DB cannot store React components)
 */
const iconMap: Record<string, any> = {
  "elearning-engineering": BookOpen,
  "media-localization": Video,
  "accessibility": Zap,
  "document-dtp": Globe,
  "content-creation": FileText,
  "ai-workflows": Users,
};

export default function Services() {
  const { data: dbServices, isLoading } =
    trpc.services.list.useQuery();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading services...</p>
      </div>
    );
  }

  // Empty state
  if (!dbServices || dbServices.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          No services available.
        </p>
      </div>
    );
  }

  // Normalize DB data
  const servicesData = dbServices
    .map((service: any) => ({
      slug: service.slug,
      title: service.name,
      shortDesc: service.shortDescription,
      fullDesc: service.description,
      image: service.image || "/placeholder-service.jpg",
      icon: iconMap[service.slug] || BookOpen,
      features:
        typeof service.keyfeatures === "string"
          ? service.keyfeatures
              .split("\n")
              .filter((f: string) => f.trim())
          : service.keyfeatures || [],
      orderIndex: service.orderindex || 0,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="w-full bg-white">
      {/* HERO */}
      <section className="pt-32 pb-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 text-blue-900">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive localization solutions tailored to your needs.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20">
        <div className="container mx-auto px-4 space-y-24">
          {servicesData.map((service, idx) => {
            const Icon = service.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } gap-12 items-center`}
              >
                {/* TEXT */}
                <div className="flex-1">
                  <Card className="p-8 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h2 className="text-3xl font-bold">
                        {service.title}
                      </h2>
                    </div>

                    <p className="text-gray-600 mb-6">
                      {service.fullDesc}
                    </p>

                    {/* FEATURES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {service.features.map(
                        (feature: string, i: number) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="text-blue-600 font-bold">
                              ✓
                            </span>
                            <span>{feature}</span>
                          </div>
                        )
                      )}
                    </div>

                    <Link href={`/services/${service.slug}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                        Learn More
                        <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </Link>
                  </Card>
                </div>

                {/* IMAGE */}
                <div className="flex-1">
                  <div className="rounded-3xl overflow-hidden shadow-2xl h-[450px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      <section className="py-24 relative z-10"> <div className="container mx-auto px-4"> <div className="relative rounded-[3rem] overflow-hidden bg-blue-600 shadow-2xl"> <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div> <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div> <div className="relative z-10 p-12 md:p-20 text-center"> <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white"> Ready to Localize Your Content? </h2> <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"> Let's discuss which services are right for your project and how we can help you expand globally. </p> <Link href="/contact"> <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all" > Get a Free Quote </Button> </Link> </div> </div> </div> </section>
    </div>
  );
}