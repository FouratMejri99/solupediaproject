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

  const { data: post, isLoading } = trpc.blog.bySlug.useQuery(slug);
  const { data: allPosts } = trpc.blog.list.useQuery();

  // Always show 3 related posts - repeat posts if needed
  const relatedPosts = (() => {
    const posts = (allPosts as Array<{ slug: string }>) || [];
    const filtered = posts.filter(p => p.slug !== slug);
    if (filtered.length >= 3) {
      return filtered.slice(0, 3);
    }
    // Repeat posts to always have 3
    const repeated = [] as typeof filtered;
    while (repeated.length < 3) {
      repeated.push(...filtered);
    }
    return repeated.slice(0, 3);
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <PageLoader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-center px-4">
        <div>
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
    <div className="min-h-screen bg-white">
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <Link href="/blog">
            <Button
              variant="ghost"
              className="gap-2 mb-10 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>

          {/* ARTICLE */}
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {post.featuredImage && (
              <div className="w-full h-72 md:h-96 relative overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            <div className="p-8 md:p-12">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                {post.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

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

              <div
                className="prose prose-lg prose-blue max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              {/* Share */}
              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-lg text-gray-900">
                  Share this post
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </motion.article>

          {/* CTA */}
          <div className="mt-20 p-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
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
                <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 rounded-full text-lg font-semibold shadow-lg whitespace-nowrap">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>

          {/* RELATED POSTS */}
          {relatedPosts.length > 0 && (
            <div className="mt-32">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
                More Blog Posts
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {relatedPosts.map((relatedPost, idx) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Card className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 flex flex-col">
                        {relatedPost.featuredImage && (
                          <div className="w-full h-60 relative overflow-hidden">
                            <img
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>
                        )}

                        <CardContent className="flex-1 p-7">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
                            {relatedPost.category}
                          </span>

                          <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relatedPost.title}
                          </h4>

                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {relatedPost.excerpt}
                          </p>

                          <div className="mt-8 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                            Read Article
                            <ArrowRight size={16} className="ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
