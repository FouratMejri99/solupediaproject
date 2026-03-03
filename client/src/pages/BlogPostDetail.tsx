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

  const { data: post, isLoading } = trpc.blog.bySlug.useQuery(slug, {
    enabled: !!slug,
  });
  const { data: allPosts } = trpc.blog.list.useQuery();

  const relatedPosts = (() => {
    if (!allPosts || !Array.isArray(allPosts) || allPosts.length <= 1) {
      return [];
    }

    const ordered = allPosts.filter((p: any) => p && p.slug);
    const currentIndex = ordered.findIndex((p: any) => p.slug === slug);

    if (currentIndex === -1) {
      // Fallback: just take first up to 3 posts
      return ordered.slice(0, 3);
    }

    const related: typeof ordered = [];
    // Walk forward from current index, wrapping around, skipping the current post
    for (
      let offset = 1;
      offset < ordered.length && related.length < 3;
      offset++
    ) {
      const idx = (currentIndex + offset) % ordered.length;
      if (idx === currentIndex) continue;
      related.push(ordered[idx]);
    }

    if (related.length === 0) {
      return [];
    }

    return related;
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
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
                More Blog Posts
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, idx) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Card className="group h-full hover:shadow-xl transition-all cursor-pointer flex flex-col overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm">
                        {relatedPost.featuredImage && (
                          <div className="w-full h-48 bg-gray-200 overflow-hidden relative group">
                            <img
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )}

                        <CardContent className="flex-1 flex flex-col justify-between pt-5 px-6 pb-6">
                          {relatedPost.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3 w-fit">
                              {relatedPost.category}
                            </span>
                          )}

                          <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>

                          {relatedPost.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                              {relatedPost.excerpt}
                            </p>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {relatedPost.author && (
                                <div className="flex items-center gap-1.5 font-medium">
                                  <User size={14} className="text-blue-500" />
                                  <span>{relatedPost.author}</span>
                                </div>
                              )}
                              {relatedPost.publishedAt && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar
                                    size={14}
                                    className="text-blue-500"
                                  />
                                  <span>
                                    {formatDate(relatedPost.publishedAt)}
                                  </span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
