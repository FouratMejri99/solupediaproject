import { PageSkeleton } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  category?: string;
  author?: string;
  publishedAt?: string | Date | null;
  featuredImage?: string;
  excerpt?: string;
}

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.all.useQuery();

  const [email, setEmail] = useState("");

  const subscribeNewsletter = trpc.leads.subscribeNewsletter.useMutation({
    onSuccess: () => {
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    },
  });

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeNewsletter.mutate({ email, type: "newsletter" });
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-blue-50/50 backdrop-blur-3xl -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-6">
              Our Blog
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900">
              Localization Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Industry trends, best practices, and expert insights to help you
              navigate the global marketplace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <PageSkeleton />
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all cursor-pointer flex flex-col overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
                      {post.featuredImage && (
                        <motion.div className="w-full h-56 bg-gray-200 overflow-hidden relative group">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.div>
                      )}
                      <CardHeader className="flex-1 pb-2">
                        {post.category && (
                          <motion.div
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3 w-fit"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                          >
                            {post.category}
                          </motion.div>
                        )}
                        <CardTitle className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-0">
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {post.author && (
                              <div className="flex items-center gap-1.5 font-medium">
                                <User size={14} className="text-blue-500" />
                                <span>{post.author}</span>
                              </div>
                            )}
                            {post.publishedAt && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-blue-500" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </div>
                            )}
                          </div>
                          <ArrowRight
                            size={16}
                            className="text-blue-600 transform group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No blog posts found.</p>
              <p className="text-gray-500 text-sm mt-2">
                Check back later for new content.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden shadow-2xl text-center"
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-800 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Stay Updated
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Subscribe to our newsletter for the latest localization
                insights, industry trends, and Solupedia updates delivered to
                your inbox.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-full border-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-blue-200 backdrop-blur-sm"
                  required
                />
                <Button
                  type="submit"
                  disabled={subscribeNewsletter.isLoading}
                  className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 rounded-full text-lg font-semibold shadow-lg transition-all"
                >
                  {subscribeNewsletter.isLoading
                    ? "Subscribing..."
                    : "Subscribe"}
                </Button>
              </form>
              <p className="text-blue-200 text-sm mt-4">
                We care about your data in our{" "}
                <Link href="/privacy" className="underline hover:text-white">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
