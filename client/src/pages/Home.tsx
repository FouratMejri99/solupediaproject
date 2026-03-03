import { PageSkeleton } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Globe,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch services from database with refresh key
  const servicesQuery = trpc.services.list.useQuery({
    _t: refreshKey,
  } as any) as any;
  const services = servicesQuery?.data;
  const servicesLoading = servicesQuery?.isLoading;

  const { data: caseStudies, isLoading: caseStudiesLoading } =
    trpc.caseStudies.list.useQuery();

  const isLoading = servicesLoading || caseStudiesLoading;

  // Derive testimonials from case studies that have testimonial content
  const caseStudyTestimonials =
    caseStudies
      ?.filter(
        (study: any) => study.testimonial && study.testimonial.trim() !== ""
      )
      ?.map((study: any) => ({
        id: study.id,
        clientName: study.testimonialAuthor || study.clientName,
        clientRole: study.testimonialRole || study.serviceType,
        content: study.testimonial,
        company: study.clientName,
        avatar: study.clientLogo,
      })) || [];

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

  // Show skeleton while loading, but only for initial load
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Static fallback data if database queries fail or return empty
  const staticServices = [
    {
      id: 1,
      name: "eLearning Engineering",
      slug: "elearning-engineering",
      shortDescription:
        "Storyline development and deep technical localization for interactive training.",
      icon: "BookOpen",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    },
    {
      id: 2,
      name: "Media Localization",
      slug: "media-localization",
      shortDescription:
        "OST, subtitling, voiceover, and AI-assisted services for multimedia.",
      icon: "Video",
      image:
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    },
    {
      id: 3,
      name: "Accessibility",
      slug: "accessibility",
      shortDescription:
        "EAA enforcement, remediation, and standards compliance for all content.",
      icon: "Zap",
      image:
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80",
    },
    {
      id: 4,
      name: "Document & DTP",
      slug: "document-dtp",
      shortDescription:
        "RTL expertise, graphics localization, and template management.",
      icon: "Globe",
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    },
    {
      id: 5,
      name: "Content Creation",
      slug: "content-creation",
      shortDescription:
        "Build once, localize efficiently - 40-60% cost savings with our methodology.",
      icon: "FileText",
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    },
    {
      id: 6,
      name: "AI Workflows",
      slug: "ai-workflows",
      shortDescription:
        "AI at every pipeline stage with intelligent tiering for maximum efficiency.",
      icon: "Users",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    },
  ];

  const staticTestimonials = [
    {
      id: 1,
      clientName: "John Smith",
      clientRole: "CEO",
      content:
        "Solupedia transformed our global outreach with their exceptional localization services. The team was professional, responsive, and delivered beyond our expectations.",
      company: "TechCorp",
      avatar: "/avatar1.png",
    },
    {
      id: 2,
      clientName: "Maria Garcia",
      clientRole: "Training Director",
      content:
        "Exceptional localization quality and turnaround time. Solupedia helped us reach learners across 20+ countries with perfectly adapted content.",
      company: "EduLearn",
      avatar: "/avatar2.png",
    },
    {
      id: 3,
      clientName: "Sarah Johnson",
      clientRole: "Marketing Director",
      content:
        "The attention to detail and cultural adaptation was impressive. Our video content resonated perfectly with international audiences.",
      company: "Global Media",
      avatar: "/avatar3.jpg",
    },
  ];

  const staticCaseStudies = [
    {
      id: 1,
      title: "TechCorp Global Expansion",
      clientName: "TechCorp",
      serviceType: "Document Localization",
    },
    {
      id: 2,
      title: "EduLearn Platform",
      clientName: "EduLearn",
      serviceType: "eLearning Localization",
    },
  ];

  // Use static data if API data is empty or missing
  const displayServices =
    services && services.length > 0 ? services : staticServices;
  const displayCaseStudies =
    caseStudies && caseStudies.length > 0 ? caseStudies : staticCaseStudies;
  const displaySuccessStories =
    caseStudies && caseStudies.length > 0 ? caseStudies : staticCaseStudies;

  // Use testimonials from case studies, fallback to static testimonials
  const displayTestimonials =
    caseStudyTestimonials.length > 0
      ? caseStudyTestimonials
      : staticTestimonials;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white min-h-[90vh] flex items-center overflow-hidden">
        {/* Abstract shapes/blobs for modern feel */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/30 backdrop-blur-sm text-blue-100 text-sm font-medium mb-6 border border-blue-400/30">
                🚀 Encyclopedia of Localization Technical Solutions
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                Localize Smarter, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                  Not Harder.
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                We can be your internal localization team—handling all the
                technical complexity from eLearning engineering and media
                adaptation to accessibility, content creation, and AI workflows.
                Your encyclopedia of localization solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 text-lg shadow-lg shadow-blue-900/20 rounded-full"
                  >
                    Get Started <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/lead-magnet">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-white/50 text-white hover:bg-white/10 hover:border-white transition-all duration-300 text-lg rounded-full backdrop-blur-sm"
                  >
                    Download Free Guide
                  </Button>
                </Link>
              </div>

              {/* Trust indicators in Hero */}
              <div className="mt-12 pt-8 border-t border-blue-400/30 flex items-center gap-8 text-blue-200">
                <div>
                  <p className="text-3xl font-bold text-white">7k+</p>
                  <p className="text-sm">Projects</p>
                </div>
                <div className="w-px h-10 bg-blue-400/30"></div>
                <div>
                  <p className="text-3xl font-bold text-white">150+</p>
                  <p className="text-sm">Languages</p>
                </div>
                <div className="w-px h-10 bg-blue-400/30"></div>
                <div>
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-sm">Satisfaction</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50 border-4 border-white/10">
                <img
                  src="/QRRik675gBAy.webp"
                  alt="Global Business Languages"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
              </div>
              {/* Floating element */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-xl shadow-xl max-w-xs"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Global Reach</p>
                    <p className="text-sm text-gray-500">Connecting cultures</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    Trusted by leaders
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {displayServices && displayServices.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">
                What We Offer
              </span>
              <h2 className="text-4xl font-bold mt-2 text-gray-900">
                Our Services
              </h2>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Comprehensive localization solutions tailored to your industry
                and content type.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(displayServices as any[])
                .slice(0, 6)
                .map((service: any, idx: number) => (
                  <Link
                    key={service.id || idx}
                    href={`/services/${service.slug}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer"
                    >
                      <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Service Image */}
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={service.image || "/placeholder-service.jpg"}
                            alt={service.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {service.shortDescription ||
                              service.shortdescription}
                          </p>
                          <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                            Learn More <ArrowRight className="ml-1 w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/services">
                <Button variant="outline" size="lg" className="rounded-full">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trusted By - New Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted By Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solupedia partners with global organizations and adheres to the
              highest industry standards
            </p>
          </div>

          {/* Featured Partnership */}
          <div className="mb-16">
            <div className="relative max-w-5xl mx-auto">
              <div
                className="bg-gradient-to-br from-white to-blue-50 
                  rounded-3xl 
                  shadow-xl 
                  border border-blue-100 
                  p-10 md:p-14 
                  transition-all duration-300 hover:shadow-2xl"
              >
                {/* Badge */}
                <div className="flex justify-center mb-8">
                  <span
                    className="px-4 py-1.5 text-xs font-semibold tracking-widest 
                       uppercase bg-blue-100 text-blue-700 
                       rounded-full"
                  >
                    Featured Partnership
                  </span>
                </div>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <img
                    src="/Blanchard_Logo.png"
                    alt="The Ken Blanchard Companies Logo"
                    className="h-20 md:h-24 object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Divider */}
                <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>

                {/* Description */}
                <p className="text-gray-600 text-center leading-relaxed max-w-3xl mx-auto">
                  Primary localization engineering partner from{" "}
                  <span className="font-semibold">2018–2025</span>. Managed
                  trademark transition, eLearning re-engineering, media
                  localization, and accessibility compliance across{" "}
                  <span className="font-semibold">21 languages </span>
                  and thousands of assets including{" "}
                  <span className="font-medium">SLII®</span>,
                  <span className="font-medium"> Self Leadership</span>, and
                  more.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Partners */}
          <div className="mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-8 text-center">
              Technology Partners
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
              {/* Microsoft */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/Microsoft logo.jpg"
                    alt="Microsoft Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Microsoft
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Storyline & Office Ecosystem
                </span>
              </div>

              {/* Adobe */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/adobe-creative-cloud.png"
                    alt="Adobe Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Adobe
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Creative Suite & Content Tools
                </span>
              </div>

              {/* Google */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/google.png"
                    alt="Google Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Google
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Cloud Services & Accessibility
                </span>
              </div>

              {/* MadCap Software */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/madcap.png"
                    alt="MadCap Software Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  MadCap Software
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Flare & Lingo Specialization
                </span>
              </div>

              {/* Articulate */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/articulate_logo_black.jpeg"
                    alt="Articulate Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Articulate
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Storyline & Rise
                </span>
              </div>

              {/* DominKnow */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/dominknow-logo.png"
                    alt="DominKnow Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  DominKnow
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  eLearning Authoring
                </span>
              </div>

              {/* Clip Studio Paint */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src="/clip-studio-paint.jpg"
                    alt="Clip Studio Paint Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Clip Studio Paint
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Digital Content Creation
                </span>
              </div>
            </div>
          </div>

          {/* Industry Standards & Certifications */}
          <div className="mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-8 text-center">
              Industry Standards & Certifications
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* WCAG 2.1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  WCAG 2.1
                </h4>
                <p className="text-sm text-gray-600">
                  Web Content Accessibility Guidelines
                </p>
              </div>

              {/* EAA Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  EAA Compliance
                </h4>
                <p className="text-sm text-gray-600">
                  European Accessibility Act
                </p>
              </div>

              {/* Section 508 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Section 508
                </h4>
                <p className="text-sm text-gray-600">
                  US Accessibility Standards
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-6">
              Join leading organizations that trust Solupedia for their
              technical localization needs
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Project <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Feature Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">
                Why Solupedia
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6">
                Experience the Difference
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We combine human expertise with cutting-edge technology to
                deliver translations that are not just accurate, but culturally
                resonant.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Expert Linguists",
                    desc: "Native speakers with deep industry knowledge.",
                  },
                  {
                    title: "Rigorous QA",
                    desc: "ISO-certified quality assurance processes.",
                  },
                  {
                    title: "Scalable Solutions",
                    desc: "Workflows that grow with your business needs.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                className="space-y-6 mt-12"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl">
                  <Users className="w-10 h-10 mb-4 opacity-80" />
                  <h3 className="text-4xl font-bold mb-1">18+</h3>
                  <p className="text-blue-100">Years Experience</p>
                </div>
                <div className="bg-gray-100 p-8 rounded-3xl shadow-lg">
                  <Award className="w-10 h-10 mb-4 text-blue-600" />
                  <h3 className="text-4xl font-bold mb-1 text-gray-900">
                    200+
                  </h3>
                  <p className="text-gray-600">Happy Clients</p>
                </div>
              </motion.div>
              <motion.div
                className="space-y-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="bg-gray-100 p-8 rounded-3xl shadow-lg">
                  <Zap className="w-10 h-10 mb-4 text-blue-600" />
                  <h3 className="text-4xl font-bold mb-1 text-gray-900">
                    Fast
                  </h3>
                  <p className="text-gray-600">Turnaround</p>
                </div>
                <div className="bg-blue-800 p-8 rounded-3xl text-white shadow-xl">
                  <Globe className="w-10 h-10 mb-4 opacity-80" />
                  <h3 className="text-4xl font-bold mb-1">150+</h3>
                  <p className="text-blue-100">Languages</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Success Stories - Using Testimonials */}
      {displayTestimonials && displayTestimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Client Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                Real results from our valued clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayTestimonials
                .slice(0, 3)
                .map((testimonial: any, idx: number) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="pt-8 px-8 pb-8 flex flex-col h-full">
                        <div className="flex items-center gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-700 mb-8 italic text-lg leading-relaxed flex-1">
                          "
                          {testimonial.content ||
                            testimonial.clientCompany ||
                            "Excellent service!"}
                          "
                        </p>
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {(testimonial.clientName || "C").charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {testimonial.clientName || "Client"}
                            </p>
                            <p className="text-sm text-blue-600 font-medium">
                              {testimonial.company ||
                                testimonial.clientRole ||
                                ""}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Case Studies Preview */}
      {displayCaseStudies && displayCaseStudies.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">
                  Portfolio
                </span>
                <h2 className="text-4xl font-bold mt-2">Featured Projects</h2>
              </div>
              <Link href="/case-studies">
                <Button variant="outline" className="rounded-full">
                  View All Projects
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              {(displayCaseStudies as any[])
                .slice(0, 2)
                .map((study: any, idx: number) => (
                  <Link key={study.id} href={`/case-studies/${study.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 }}
                      className="group cursor-pointer"
                    >
                      <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-2xl">
                        <div className="p-8 md:p-10">
                          <div className="flex justify-between items-start mb-6">
                            <div className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                              {study.industry}
                            </div>
                            <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-700 transition-colors">
                            {study.title}
                          </h3>
                          <p className="text-gray-600 mb-6 line-clamp-3">
                            {study.solution}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Challenge
                              </p>
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {study.challenge}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Result
                              </p>
                              <p className="text-sm font-bold text-blue-600 line-clamp-2">
                                {study.results}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Modernized */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Go Global?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let us help you reach new markets with professional localization
            solutions tailored to your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="h-16 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/50 hover:scale-105 transition-transform"
              >
                Get a Free Quote
              </Button>
            </Link>
            <Link href="/lead-magnet">
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white rounded-full transition-all"
              >
                Download Our Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
