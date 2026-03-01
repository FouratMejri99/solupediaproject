import { PageLoader } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Share2, User } from "lucide-react";
import { Link, useParams } from "wouter";

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch post by slug from Supabase
  const { data: post, isLoading } = trpc.blog.bySlug.useQuery(slug);

  // Fetch all posts for the "More Blog Posts" section
  const { data: allPosts } = trpc.blog.list.useQuery();

  // Filter out current post and get related posts
  const relatedPosts = allPosts
    ?.filter((p: { slug: string }) => p.slug !== slug)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden">
        <PageLoader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden">
        {/* Background Blobs */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, the blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Blog Post Content */}
        <div className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Back Button */}
            <Link href="/blog">
              <Button
                variant="ghost"
                className="gap-2 mb-8 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Post Content */}
              <article className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="w-full h-64 md:h-80 relative overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                )}

                <div className="p-8 md:p-12">
                  {/* Category Badge */}
                  <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-6 text-gray-600 mb-10 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span>By {post.author}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div
                    className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                  />

                  {/* Share Section */}
                  <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-gray-900 font-semibold text-lg">
                      Share this post:
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 p-10 md:p-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">
                    Need Expert Localization Services?
                  </h3>
                  <p className="text-blue-100 text-lg max-w-xl">
                    Solupedia specializes in professional localization solutions
                    across all industries.
                  </p>
                </div>
                <Link href="/contact">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 rounded-full text-lg font-semibold shadow-lg transition-all whitespace-nowrap">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Related Posts from Supabase */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-24">
                <h3 className="text-3xl font-bold text-gray-900 mb-10">
                  More Blog Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(
                    (
                      relatedPost: {
                        id: string | number;
                        slug: string;
                        title: string;
                        category?: string;
                        excerpt?: string;
                        featuredImage?: string;
                      },
                      idx: number
                    ) => (
                      <motion.div
                        key={relatedPost.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <Card className="hover:shadow-xl transition-all cursor-pointer flex flex-col border-none shadow-lg bg-white/80 backdrop-blur-sm group overflow-hidden rounded-2xl">
                            {relatedPost.featuredImage && (
                              <div className="w-full h-36 bg-gray-200 overflow-hidden relative">
                                <img
                                  src={relatedPost.featuredImage}
                                  alt={relatedPost.title}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                              </div>
                            )}
                            <CardContent className="flex-1 p-4">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide mb-2">
                                {relatedPost.category}
                              </span>
                              <h4 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {relatedPost.title}
                              </h4>
                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                {relatedPost.excerpt}
                              </p>
                              <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                                Read Article{" "}
                                <ArrowRight size={14} className="ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
