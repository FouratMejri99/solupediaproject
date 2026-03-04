import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
      <section className="relative pt-32 pb-20 z-10">
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
      </section>

      {/* CONTENT */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-16">
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

            <div>
              <h2 className="text-3xl font-bold mb-8">Our Process</h2>
              <div className="space-y-6">
                {process.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="shadow-xl bg-blue-600 text-white">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  Ready to localize your {dbService.name.toLowerCase()}?
                </p>
                <Link href="/contact">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Request a Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div className="flex gap-3">
                  <Calendar size={18} className="text-blue-600" />
                  18+ years of experience
                </div>
                <div className="flex gap-3">
                  <FileText size={18} className="text-blue-600" />
                  7,000+ successful projects
                </div>
                <div className="flex gap-3">
                  <Globe size={18} className="text-blue-600" />
                  150+ languages supported
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
