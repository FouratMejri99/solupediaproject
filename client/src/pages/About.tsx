import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Award,
  Clock,
  Globe,
  Heart,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";

// Images for About page
const aboutImages = {
  hero: "/Q28pGcqz0bJZ.png",
  story: "/Solupedia-creation-solutions.jpg",
  team: "/36douFTBRlV3.jpg",
  values: "/c3PMerwguXIA.jpg",
};

export default function About() {
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/30 backdrop-blur-sm text-blue-100 text-sm font-medium mb-6 border border-blue-400/30">
              About Us
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Bridging Worlds Through <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                Language & Technology
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Leading the localization industry with expertise, innovation, and
              an unwavering commitment to global communication since 2006.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-8 text-gray-900">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  Founded in 2006, Solupedia emerged from a simple insight:
                  localization is a technical challenge, not just a language
                  one. Nearly two decades later, we've become the technical
                  backbone that enterprises trust to handle their most complex
                  localization needs.
                </p>
                <p>
                  Our mission has always been clear, eliminate the technical
                  complexity of localization. We've evolved from traditional
                  translation services to becoming the technical team that
                  handles every layer—eLearning engineering, media adaptation,
                  accessibility compliance, document optimization, content
                  creation, and AI workflows orchestration.
                </p>
                <p>
                  We're not just a localization vendor, we're your internal
                  team. Your encyclopedia of technical solutions. With 7,000+
                  projects completed for 200+ clients across industries, we've
                  proven that technical mastery in localization drives real
                  global impact.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                  <img
                    src={aboutImages.story}
                    alt="Our Story - Team at work"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl">
                        <div className="text-3xl font-bold text-blue-600">
                          18+
                        </div>
                        <p className="text-gray-700 font-medium text-sm">
                          Years in Business
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl">
                        <div className="text-3xl font-bold text-blue-600">
                          7k+
                        </div>
                        <p className="text-gray-700 font-medium text-sm">
                          Projects Completed
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl">
                        <div className="text-3xl font-bold text-blue-600">
                          200+
                        </div>
                        <p className="text-gray-700 font-medium text-sm">
                          Satisfied Clients
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl">
                        <div className="text-3xl font-bold text-blue-600">
                          150+
                        </div>
                        <p className="text-gray-700 font-medium text-sm">
                          Languages
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-blue-50/50 py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that drive our commitment to excellence every
              single day
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Heart,
                title: "Excellence",
                desc: "We're committed to delivering the highest quality localization solutions through meticulous technical engineering, automated workflows, and quality assurance that ensures flawless execution.",
              },
              {
                icon: Target,
                title: "Innovation",
                desc: "We continuously invest in cutting-edge technology and methodologies to stay ahead of industry trends and serve our clients better.",
              },
              {
                icon: Users,
                title: "Partnership",
                desc: "We view our clients as partners, working collaboratively to understand their unique needs and deliver solutions that exceed expectations.",
              },
            ].map((value, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 leading-relaxed">
                      {value.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solupedia comprises a diverse team of specialized professionals
              dedicated to delivering exceptional localization solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]">
                <img
                  src={aboutImages.team}
                  alt="Our Expert Team"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Meet Our Team
                  </h3>
                  <p className="text-blue-100 text-lg">
                    Passionate professionals dedicated to your success
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  role: "Localization Engineers",
                  icon: Zap,
                  desc: "Technical experts who manage complex localization workflows and ensure seamless integration",
                },
                {
                  role: "RTL Native Speakers",
                  icon: Globe,
                  desc: "Native speakers with subject matter expertise across various industries",
                },
                {
                  role: "eLearning Specialists",
                  icon: Award,
                  desc: "Experts in adapting educational content for global audiences",
                },
                {
                  role: "Audio/Video Editors",
                  icon: Users,
                  desc: "Professionals skilled in dubbing, subtitling, and multimedia localization",
                },
                {
                  role: "Desktop Publishers",
                  icon: Target,
                  desc: "Specialists in formatting and layout for localized documents",
                },
                {
                  role: "Project Managers",
                  icon: Shield,
                  desc: "Experienced coordinators ensuring timely delivery and client satisfaction",
                },
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {item.role}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 py-24 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Partner With Solupedia?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your success is our priority. Here is why leading companies choose
              us.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Industry Experience",
                icon: Award,
                desc: "Nearly two decades of proven expertise in localization across diverse sectors",
              },
              {
                title: "Comprehensive Services",
                icon: Globe,
                desc: "One-stop solution for all your localization needs, from creation to delivery",
              },
              {
                title: "Quality Assurance",
                icon: Shield,
                desc: "Rigorous QA processes ensuring culturally appropriate and accurate content",
              },
              {
                title: "Fast Turnaround",
                icon: Clock,
                desc: "Efficient workflows enabling quick delivery without compromising quality",
              },
              {
                title: "Global Reach",
                icon: Users,
                desc: "Support for 150+ languages and deep understanding of cultural nuances",
              },
              {
                title: "Client-Centric Approach",
                icon: Heart,
                desc: "Dedicated support and customized solutions tailored to your specific needs",
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-200 mb-6">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
