import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Edit2,
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// Helper function to convert File to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Custom Quill Editor component compatible with React 19
function QuillEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.blog.uploadImage.useMutation();

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const dataUrl = await fileToDataUrl(file);
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        dataUrl,
      });
      return result.url;
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const url = await handleImageUpload(file);
    if (url && quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.insertEmbed(range.index, "image", url);
      }
    }

    // Reset input
    e.target.value = "";
  };

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link"],
            ["image"],
            ["clean"],
          ],
        },
        placeholder: "Write your blog content here...",
      });

      // Custom image handler
      const toolbar = quill.getModule("toolbar") as any;
      toolbar.addHandler("image", handleImageButtonClick);

      quillRef.current = quill;

      // Handle text changes
      quill.on("text-change", () => {
        if (isInternalChange.current) {
          return;
        }
        const html = quill.root.innerHTML;
        onChange(html === "<p><br></p>" ? "" : html);
      });

      // Set initial value
      if (value) {
        quill.root.innerHTML = value;
      }
    } else if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      // Update value from props
      isInternalChange.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value;
      if (selection) {
        quillRef.current.setSelection(selection);
      }
      isInternalChange.current = false;
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isInternalChange.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value;
      if (selection) {
        quillRef.current.setSelection(selection);
      }
      isInternalChange.current = false;
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
      <div ref={editorRef} className="quill-editor" />
      {isUploading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Upload className="animate-bounce" size={20} />
            <span>Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Solupedia",
    category: "",
    tags: "",
    featuredImage: "",
    published: true,
    order: 0,
  });

  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.all.useQuery();
  const createMutation = trpc.blog.create.useMutation();
  const updateMutation = trpc.blog.update.useMutation();
  const deleteMutation = trpc.blog.delete.useMutation();
  const updateOrderMutation = trpc.blog.updateOrder.useMutation();
  const uploadMutation = trpc.blog.uploadImage.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [orderingId, setOrderingId] = useState<number | null>(null);

  // Check admin session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      setLocation("/solupedia-admin");
      return;
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPost) {
        // Update existing post
        await updateMutation.mutateAsync({
          id: editingPost.id,
          updates: formData,
        });
        toast.success("Blog post updated successfully!");
        setShowForm(false);
        resetForm();
        utils.invalidate("blog.all");
        setIsSubmitting(false);
        return;
      }

      // Generate slug from title if not provided
      const slug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      await createMutation.mutateAsync({
        ...formData,
        slug,
        publishedAt: new Date(),
      });

      toast.success("Blog post created successfully!");
      setShowForm(false);
      resetForm();
      utils.invalidate("blog.all");
      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create blog post");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Blog post deleted successfully!");
      utils.invalidate("blog.all");
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete blog post");
      setDeletingId(null);
    }
  };

  const handleMoveUp = async (id: number, idx: number) => {
    if (!filteredPosts || idx === 0) return;
    setOrderingId(id);
    try {
      const currentPost = filteredPosts[idx];
      const prevPost = filteredPosts[idx - 1];
      // Swap orders
      await updateOrderMutation.mutateAsync({
        id,
        order: prevPost.order ?? idx,
      });
      await updateOrderMutation.mutateAsync({
        id: prevPost.id,
        order: currentPost.order ?? idx + 1,
      });
      utils.invalidate("blog.all");
      toast.success("Order updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update order");
    } finally {
      setOrderingId(null);
    }
  };

  const handleMoveDown = async (id: number, idx: number) => {
    if (!filteredPosts || idx === filteredPosts.length - 1) return;
    setOrderingId(id);
    try {
      const currentPost = filteredPosts[idx];
      const nextPost = filteredPosts[idx + 1];
      // Swap orders
      await updateOrderMutation.mutateAsync({
        id,
        order: nextPost.order ?? idx + 2,
      });
      await updateOrderMutation.mutateAsync({
        id: nextPost.id,
        order: currentPost.order ?? idx + 1,
      });
      utils.invalidate("blog.all");
      toast.success("Order updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update order");
    } finally {
      setOrderingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "Solupedia",
      category: "",
      tags: "",
      featuredImage: "",
      published: true,
      order: 0,
    });
    setEditingPost(null);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredPosts = posts?.filter(
    post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg"
              >
                <FileText className="text-white" size={20} />
              </motion.div>
              <div>
                <h1 className="font-bold text-gray-900">Blog Management</h1>
                <p className="text-xs text-gray-600">
                  Create and manage blog posts
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/dashboard")}
                className="rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
              >
                <Plus size={18} className="mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Search Bar */}
        <motion.div
          className="mb-8 max-w-md mx-auto md:mx-0 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts && filteredPosts.length > 0 ? (
                filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full flex flex-col bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
                      {post.featuredImage && (
                        <div className="w-full h-48 bg-gray-200 overflow-hidden relative group">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      <CardHeader className="flex-1 pb-2">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {post.category && (
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-full">
                                {post.category}
                              </span>
                            )}
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{post.order ?? idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveUp(post.id, idx)}
                              disabled={idx === 0 || orderingId === post.id}
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ArrowUp size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(post.id, idx)}
                              disabled={
                                idx === (filteredPosts?.length ?? 1) - 1 ||
                                orderingId === post.id
                              }
                              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ArrowDown size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            post.published
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        {post.excerpt && (
                          <CardDescription className="mt-2 line-clamp-2 text-gray-600">
                            {post.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3 pt-0 mt-auto">
                        <div className="text-xs text-gray-500 flex items-center gap-2 border-t border-gray-100 pt-3">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          {formatDate(post.publishedAt)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPost(post);
                              setFormData({
                                title: post.title || "",
                                slug: post.slug || "",
                                excerpt: post.excerpt || "",
                                content: post.content || "",
                                author: post.author || "Solupedia",
                                category: post.category || "",
                                tags: post.tags || "",
                                featuredImage: post.featuredImage || "",
                                published: post.published ?? true,
                                order: post.order ?? 0,
                              });
                              setShowForm(true);
                            }}
                            className="flex-1 rounded-full hover:bg-blue-50 hover:text-blue-600 border-gray-200"
                          >
                            <Edit2 size={14} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="flex-1 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            {deletingId === post.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mr-1" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 font-medium">
                    No blog posts found.
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Your First Post
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Update the blog post details below."
                : "Fill in the details to create a new blog post."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={e =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Auto-generated from title"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={e =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <div className="prose-editor">
                <QuillEditor
                  value={formData.content}
                  onChange={(value: string) =>
                    setFormData({ ...formData, content: value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={e =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={e =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="e.g., technology, news, updates"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={e =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Order number (lower numbers appear first)"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image</Label>
              <div className="flex gap-2">
                <label
                  htmlFor="featuredImageUpload"
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="file"
                    id="featuredImageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        const dataUrl = await fileToDataUrl(file);
                        const result = await uploadMutation.mutateAsync({
                          fileName: file.name,
                          contentType: file.type,
                          dataUrl,
                        });
                        setFormData({ ...formData, featuredImage: result.url });
                        toast.success("Image uploaded successfully!");
                      } catch (error: any) {
                        toast.error(error?.message || "Failed to upload image");
                      }
                    }}
                  />
                  <Upload className="mr-2" size={18} />
                  <span>Choose File</span>
                </label>
                {formData.featuredImage && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, featuredImage: "" })
                      }
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {uploadMutation.isPending && (
                <p className="text-sm text-blue-600">Uploading...</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={e =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                    {editingPost ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingPost ? "Update Post" : "Create Post"}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
