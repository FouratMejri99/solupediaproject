import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
} from "lucide-react";
import { Link, useRoute } from "wouter";

// Static fallback data for services
const staticServiceDetails: Record<string, any> = {
  "elearning-engineering": {
    title: "eLearning Engineering",
    description: "Storyline development and deep technical localization for interactive training",
    image: "/tQhhiaQyUpCd.jpg",
    fullContent:
      "Our eLearning Engineering service provides comprehensive solutions for developing and localizing interactive training content. From Storyline development to deep technical localization, we ensure your training materials engage learners across all languages and cultures. Our team of experts specializes in creating immersive learning experiences that work seamlessly in any language, maintaining all interactivity and pedagogical effectiveness.",
    benefits: [
      "Storyline Development - Custom eLearning course development using Articulate Storyline",
      "Deep Technical Localization - Complex technical adaptations for multilingual deployments",
      "Interactive Element Adaptation - Buttons, simulations, and interactive components localization",
      "SCORM Compliance - Standards-compliant packages for any Learning Management System",
      "LMS Integration - Seamless integration with major LMS platforms worldwide",
      "Accessibility Compliance (WCAG) - Ensuring courses meet accessibility standards",
      "Multi-language Asset Management - Efficient handling of multilingual media assets",
      "Gamification Elements - Localization of leaderboards, badges, and reward systems",
    ],
    process: [
      "Content analysis and technical requirements gathering",
      "Storyboarding and localization strategy development",
      "Interactive element development and adaptation",
      "Multilingual content integration and testing",
      "SCORM package validation and LMS testing",
      "Quality assurance and learner experience verification",
      "Deployment support and ongoing maintenance",
    ],
  },
  "media-localization": {
    title: "Media Localization",
    description: "OST, subtitling, voiceover, and AI-assisted services for multimedia",
    image: "/Solupedia-video-editing-localization.jpg",
    fullContent:
      "Our Media Localization service covers all aspects of multimedia content adaptation. From original sound track (OST) production to subtitling, voiceover, and AI-assisted services, we bring your video content to life in any language. Our state-of-the-art facilities and experienced team ensure broadcast-quality results that maintain the emotional impact of your original content.",
    benefits: [
      "Original Sound Track (OST) Production - Custom music composition for localized versions",
      "Professional Subtitling - Accurate, well-timed subtitles in any language",
      "Voice-over and Dubbing - Native speaker voice talent with studio-quality recording",
      "AI-assisted Translation - Accelerated translation using advanced AI technology",
      "Audio Synchronization - Perfect timing sync with visual content",
      "Cultural Adaptation - Modifying visual elements for cultural relevance",
      "Closed Captioning - Accessible captions for hearing-impaired viewers",
      "Audio Description - Narration of visual elements for accessibility",
    ],
    process: [
      "Script analysis and adaptation for target markets",
      "Voice talent casting and recording sessions",
      "Audio editing, mixing, and synchronization",
      "Subtitle creation, timing, and formatting",
      "Visual element adaptation and graphics localization",
      "Quality assurance and client review",
      "Final delivery in multiple formats",
    ],
  },
  "accessibility": {
    title: "Accessibility",
    description: "EAA enforcement, remediation, and standards compliance for all content",
    image: "/Solupedia-document-localization.jpg",
    fullContent:
      "Our Accessibility service ensures your content meets all major accessibility standards including EAA (European Accessibility Act), WCAG, and Section 508. We provide comprehensive remediation services to make your content accessible to everyone, regardless of ability. Our team of accessibility experts helps you navigate complex regulations while improving user experience for all audiences.",
    benefits: [
      "EAA Compliance - European Accessibility Act compliance for products and services",
      "WCAG 2.1 Remediation - Full Web Content Accessibility Guidelines compliance",
      "Section 508 Compliance - US federal accessibility requirements",
      "PDF Accessibility - Creating accessible PDF documents with proper tags",
      "Video Captioning - Accurate captions for all video content",
      "Audio Description - Professional narration of visual content",
      "Accessibility Testing - Comprehensive testing with assistive technologies",
      "Accessibility Audits - Detailed analysis of current accessibility gaps",
    ],
    process: [
      "Initial accessibility audit and gap analysis",
      "Remediation strategy development",
      "Content remediation and reconstruction",
      "Alternative format creation (Braille, large print, audio)",
      "Testing with assistive technologies",
      "Compliance documentation and certification",
      "Ongoing monitoring and updates",
    ],
  },
  "document-dtp": {
    title: "Document & DTP",
    description: "RTL expertise, graphics localization, and template management",
    image: "/0.jpg",
    fullContent:
      "Our Document & DTP service handles all aspects of document localization including RTL (right-to-left) language support, graphics localization, and professional template management. We ensure your documents look perfect in every language, maintaining the design integrity and professional appearance of your original content.",
    benefits: [
      "RTL Language Support - Full support for Arabic, Hebrew, Persian, and other RTL languages",
      "Graphics Localization - Adapting images and graphics for different markets",
      "Template Management - Creating and maintaining reusable templates",
      "Desktop Publishing - Professional DTP in all major software",
      "Multi-format Output - Delivery in PDF, Word, InDesign, and more",
      "Format Preservation - Maintaining original layout and design fidelity",
      "Font Management - Proper font handling for multilingual documents",
      "Variable Data Publishing - Personalized document generation",
    ],
    process: [
      "Source document analysis and style review",
      "Template creation or adaptation",
      "Translation integration and text flow testing",
      "Graphics and image localization",
      "RTL layout adjustments where needed",
      "Proofreading and quality check",
      "Final output generation and delivery",
    ],
  },
  "content-creation": {
    title: "Content Creation",
    description: "Build once, localize efficiently - 40-60% cost savings with our methodology",
    image: "/Solupedia-document-localization.jpg",
    fullContent:
      "Our Content Creation service is designed from the ground up for efficient localization. By following our proven methodology, you can achieve 40-60% cost savings while maintaining high quality across all languages. We help you create content that is inherently ready for localization, reducing revision cycles and maximizing efficiency.",
    benefits: [
      "Localization-friendly Authoring - Creating content optimized for translation",
      "Internationalization Consulting - Technical guidance for global-ready content",
      "Terminology Management - Building and maintaining multilingual glossaries",
      "Style Guide Development - Consistent writing style across languages",
      "Translation Memory Optimization - Maximizing reuse of translated content",
      "Continuous Localization Workflow - Agile, ongoing translation processes",
      "Content Audit - Analyzing existing content for localization readiness",
      "Authoring Tool Selection - Recommending the best tools for your needs",
    ],
    process: [
      "Content audit and localization readiness assessment",
      "Localization strategy and roadmap development",
      "Terminology and style guide creation",
      "Content creation with internationalization best practices",
      "Translation memory setup and optimization",
      "Pilot project and process refinement",
      "Full-scale production and continuous improvement",
    ],
  },
  "ai-workflows": {
    title: "AI Workflows",
    description: "AI at every pipeline stage with intelligent tiering for maximum efficiency",
    image: "/AIWorkflows.jpg",
    fullContent:
      "Our AI Workflows service integrates artificial intelligence at every stage of the localization pipeline. With intelligent tiering, we optimize the balance between AI efficiency and human quality for the best results. Our proprietary AI solutions accelerate delivery times while maintaining the quality standards your brand requires.",
    benefits: [
      "AI-powered Translation - Neural machine translation with custom training",
      "Intelligent Content Tiering - Automatic routing based on content type and quality needs",
      "Machine Translation Post-Editing (MTPE) - Human refinement of AI translations",
      "AI-assisted Quality Assurance - Automated error detection and correction",
      "Predictive Terminology - AI-powered terminology suggestions",
      "Automated Workflow Orchestration - Seamless handoffs between AI and human stages",
      "Custom AI Models - Tailored models for domain-specific content",
      "Real-time Analytics - Performance monitoring and optimization insights",
    ],
    process: [
      "Content analysis and tier classification",
      "AI model selection and configuration",
      "Automated translation and processing",
      "Human review and post-editing",
      "Quality assurance and validation",
      "Performance analytics and optimization",
      "Continuous learning and improvement",
    ],
  },
  "document-localization": {
    title: "Document Localization",
    description: "Professional translation and desktop publishing services",
    image: "/Solupedia-document-localization.jpg",
    fullContent:
      "Our document localization services transform your content for global audiences. We handle everything from translation to formatting, ensuring your documents maintain their professional appearance and impact across languages and cultures. Whether you need to localize technical manuals, marketing materials, legal documents, or user guides, our expert team ensures every word resonates with your target audience while maintaining your brand voice and visual identity.",
    benefits: [
      "Technical Translation - Accurate translation of technical manuals, specs, and user guides",
      "Marketing Transcreation - Creative adaptation of marketing materials to resonate with local cultures",
      "Desktop Publishing (DTP) - Formatting translated documents to match original layout and design",
      "Certified Translation - Official translations for legal and regulatory purposes",
      "Machine Translation Post-Editing (MTPE) - Cost-effective solutions combining AI speed with human quality",
      "Terminology Management - Creating and maintaining glossaries for consistency",
      "Software Localization - Adapting user interfaces and software documentation",
      "Website Localization - Translating web content for global audiences",
    ],
    process: [
      "Content analysis and terminology development",
      "Translation by specialized translators with industry expertise",
      "Desktop publishing and formatting to match original layout",
      "Quality assurance and proofreading by independent reviewers",
      "Cultural review and adaptation",
      "Final review and delivery with comprehensive documentation",
    ],
  },
  "elearning-localization": {
    title: "eLearning Localization",
    description: "Course adaptation for global learners",
    image: "/tQhhiaQyUpCd.jpg",
    fullContent:
      "Create engaging learning experiences for international audiences. Our eLearning localization experts adapt your courses, ensuring cultural relevance and pedagogical effectiveness across different regions. We work with all major LMS platforms and understand the unique challenges of localizing interactive content, assessments, and multimedia elements. From SCORM packages to modern xAPI implementations, we ensure your courses deliver consistent learning outcomes globally.",
    benefits: [
      "Courseware Translation - Adapting Articulate, Captivate, and other course formats",
      "Voice-Over & Dubbing - Professional narration in native languages",
      "Subtitling - Synchronized subtitles for video components",
      "LMS Testing & Integration - Ensuring seamless functionality on your Learning Management System",
      "Graphic & Image Localization - Editing on-screen text and graphics",
      "Quality Assurance (QA) - Rigorous linguistic and functional testing",
      "Cultural Adaptation - Modifying scenarios and examples for local relevance",
      "Accessibility Compliance - Ensuring courses meet WCAG standards in all languages",
    ],
    process: [
      "Learning objectives analysis and course structure review",
      "Content translation and pedagogical adaptation",
      "Multimedia localization and cultural review",
      "LMS testing and integration verification",
      "Quality assurance and learner feedback collection",
      "Performance optimization and final deployment",
    ],
  },
  "audio-video-localization": {
    title: "Audio/Video Localization",
    description: "Dubbing, subtitles, and voice-over services",
    image: "/Solupedia-video-editing-localization.jpg",
    fullContent:
      "Bring your video content to life in any language. From professional dubbing to accurate subtitles, we provide complete audio and video localization services that maintain the emotional impact of your original content. Our state-of-the-art recording facilities and experienced voice talent network ensure your videos resonate with audiences worldwide. Whether you are localizing corporate training videos, marketing content, or entertainment material, we deliver broadcast-quality results.",
    benefits: [
      "Voice-Over - Professional narration for documentaries, e-learning, and corporate videos",
      "Dubbing / Lip-Sync - Precise synchronization of spoken words with lip movements",
      "Subtitling - Clear and readable subtitles in target languages",
      "Closed Captioning - Accessible captions for the hearing impaired",
      "Audio Description - Narration of visual elements for accessibility",
      "Video Editing - Integrating localized assets and text into the final video",
      "Transcription - Accurate text records of audio and video content",
      "Script Adaptation - Modifying scripts for timing and cultural nuance",
    ],
    process: [
      "Script adaptation and localization for natural speech patterns",
      "Voice talent casting and professional recording sessions",
      "Audio editing, mixing, and synchronization",
      "Subtitle creation, timing, and formatting",
      "Visual element adaptation and on-screen text localization",
      "Final quality assurance and delivery in multiple formats",
    ],
  },
  "creation-solutions": {
    title: "Creation Solutions",
    description: "Innovative content creation and transformation services",
    image: "/Solupedia-creation-solutions.jpg",
    fullContent:
      "Welcome to Solupedia's creation solutions, where innovation meets expertise. Our team of experts understands the importance of creating high-quality materials that are ready for localization. From documents to eLearning courses and videos, we work with you to create content that is engaging, informative, and optimized for a global audience. Let us help you unleash the full potential of your content and drive results for your business.",
    benefits: [
      "Accessibility Compliance - Ensuring all materials meet accessibility standards for inclusive global audiences",
      "File Conversions - Converting files between different formats to optimize for localization workflows",
      "Forms and Interactive PDFs - Creating intelligent, interactive forms and ePDFs ready for multilingual deployment",
      "Transcription Services - Converting audio and video content to accurate text transcripts",
      "Subtitling with Timecodes - Creating properly timed subtitles for video content in multiple languages",
      "AI-Powered Content Creation - Leveraging advanced AI technology to create, enhance, and manipulate various content types",
      "eLearning Course Creation - Developing engaging, interactive courses optimized for global learners",
      "Document Creation and Preparation - Professional document creation ready for translation and localization",
      "Web-Based Content Development - Creating web-optimized content and documentation for digital platforms",
      "Video and Audio Production - Professional video and audio creation with localization in mind",
    ],
    process: [
      "Localization strategy development and roadmap creation",
      "Content creation with localization best practices",
      "Asset organization and management system setup",
      "Terminology database creation and maintenance",
      "Style guide development and documentation",
      "Team training and ongoing support",
      "Performance monitoring and continuous improvement",
    ],
  },
};

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";

  // Fetch service from database by slug
  const queryResult = trpc.services.getBySlug.useQuery(slug as any) as any;
  const dbService = queryResult?.data;
  const refetch = queryResult?.refetch;
  
  // Get static fallback data
  const staticService = staticServiceDetails[slug];
  
  // Merge database data with static data
  const service = dbService ? {
    title: dbService.name || staticService?.title || "",
    description: dbService.shortDescription || dbService.shortdescription || staticService?.description || "",
    image: dbService.image || staticService?.image || "",
    fullContent: dbService.description || staticService?.fullContent || "",
    benefits: staticService?.benefits || [],
    process: staticService?.process || [],
  } : staticService;

  // Refresh data when page becomes visible (e.g., after admin update)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && refetch) {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  if (!service) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold mb-6 text-gray-900">404</h1>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Service Not Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The service you are looking for does not exist or has been moved.
            </p>
            <Link href="/services">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                <ArrowLeft className="mr-2" size={20} /> Back to Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden bg-white">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-blue-50/50 backdrop-blur-3xl -z-10"></div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/services">
              <Button
                variant="ghost"
                className="pl-0 hover:pl-2 transition-all text-blue-600 hover:bg-transparent hover:text-blue-700"
              >
                <ArrowLeft className="mr-2" size={20} /> Back to Services
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 leading-tight">
                {service.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 px-8"
                  >
                    Get Started <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full transform scale-90"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video border border-white/20">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  Overview
                </h2>
                <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                  <p>{service.fullContent}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-gray-900">
                  Key Benefits
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {service.benefits.map((benefit: string, idx: number) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-gray-900">
                  Our Process
                </h2>
                <div className="space-y-6">
                  {service.process.map((step: string, idx: number) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-6 relative"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      {idx !== service.process.length - 1 && (
                        <div className="absolute left-[1.65rem] top-12 bottom-[-1.5rem] w-0.5 bg-blue-100"></div>
                      )}
                      <div className="w-14 h-14 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-sm z-10">
                        {idx + 1}
                      </div>
                      <div className="pt-3">
                        <p className="text-lg text-gray-700 font-medium leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-none shadow-xl bg-blue-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-2xl">Get Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      <p className="text-blue-100">
                        Ready to localize your {service.title.toLowerCase()}?
                        Our team is here to help.
                      </p>
                      <Link href="/contact">
                        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 h-12 rounded-full font-semibold">
                          Request a Quote
                        </Button>
                      </Link>
                      <div className="pt-4 border-t border-blue-500/30">
                        <p className="text-sm text-blue-200 mb-2">
                          Have questions?
                        </p>
                        <p className="font-semibold">+20 01555335577</p>
                        <p className="text-blue-200">support@solupedia.com</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-gray-100 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Why Choose Us?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-600 text-sm">
                            18+ years of industry experience
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-600 text-sm">
                            7,000+ successful projects
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-600 text-sm">
                            150+ languages supported
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-gray-600 text-sm">
                            Quality assurance guaranteed
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Let us discuss how our {service.title.toLowerCase()} services
                can help your business reach new markets.
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Schedule a Consultation{" "}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
