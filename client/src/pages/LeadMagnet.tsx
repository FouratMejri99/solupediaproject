import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadsService } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LeadMagnet() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // Submit to database - this will also send admin notifications and confirmation email
      await leadsService.subscribeNewsletter(
        formData.email,
        "guide_request",
        formData.name,
        formData.company
      );

      toast.success("Thank you! Check your email for the guide.");
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: "", email: "", company: "" });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full relative overflow-hidden bg-white">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden z-10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-6">
              Free Resource
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900">
              The Ultimate Guide to eLearning Localization
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Master the essentials of localizing educational content for global
              audiences with our comprehensive guide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl mb-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    What You'll Learn
                  </h2>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "The fundamentals of eLearning localization",
                    "Cultural adaptation strategies for educational content",
                    "Best practices for multimedia localization",
                    "Technical considerations for LMS integration",
                    "Quality assurance processes for learning content",
                    "Common pitfalls and how to avoid them",
                    "ROI calculation for localization projects",
                    "Future trends in global learning",
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">
                    Guide Includes:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">✓</span> 40+
                      pages of insights
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">✓</span>{" "}
                      Real-world case studies
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">✓</span>{" "}
                      Practical checklists
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">✓</span>{" "}
                      Resource recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className="shadow-2xl border-white/20 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Download size={24} />
                    </div>
                    Download Free Guide
                  </CardTitle>
                  <p className="text-blue-100 mt-2 opacity-90">
                    Join 2,000+ learning professionals who have downloaded this
                    guide.
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Check your email for the guide. It should arrive in a
                        few moments.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="john@company.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="Your Company"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <span className="flex items-center gap-2">
                          {isSending ? "Sending..." : "Get Free Guide"}
                          {!isSending && <ArrowRight size={20} />}
                        </span>
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        We respect your privacy. Unsubscribe anytime.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-1.5 h-full bg-yellow-400 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-yellow-800">
                  <strong>Limited Time:</strong> Get instant access to the guide
                  plus exclusive tips and resources delivered to your inbox.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why This Guide */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Why This Guide?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              eLearning localization is complex. This guide cuts through the
              confusion and provides actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Save Time",
                desc: "Learn from our 18 years of experience. Avoid common mistakes and accelerate your localization timeline.",
              },
              {
                title: "Reduce Costs",
                desc: "Understand best practices that help you optimize your localization budget and maximize ROI.",
              },
              {
                title: "Expand Globally",
                desc: "Get the knowledge you need to successfully launch your eLearning content in new markets.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-all rounded-3xl overflow-hidden">
                  <CardHeader className="bg-blue-50/50">
                    <CardTitle className="text-blue-900">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Author */}
      <section className="py-20 relative z-10 bg-gradient-to-b from-transparent to-blue-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
              About the Author
            </h2>
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-lg border border-white/40">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                This guide was created by the{" "}
                <span className="font-bold text-blue-600">Solupedia team</span>,
                industry leaders with nearly two decades of experience in
                localization. We've worked with hundreds of organizations to
                successfully localize their eLearning content for global
                audiences.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our expertise spans multiple industries including technology,
                healthcare, finance, and education. We've learned what works,
                what doesn't, and how to navigate the complexities of global
                learning.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] overflow-hidden bg-blue-600 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>

            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Localize Your eLearning?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                After reading the guide, let's discuss how Solupedia can help
                you bring your courses to global audiences.
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => (window.location.href = "/contact")}
              >
                Schedule a Consultation{" "}
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
