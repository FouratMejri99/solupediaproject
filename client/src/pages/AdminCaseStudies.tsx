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
  ArrowLeft,
  Edit2,
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminCaseStudies() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingStudy, setEditingStudy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    clientName: "",
    clientLogo: "",
    industry: "",
    serviceType: "",
    challenge: "",
    solution: "",
    results: "",
    testimonial: "",
    testimonialAuthor: "",
    testimonialRole: "",
    imageUrl: "",
    featured: false,
  });

  const utils = trpc.useUtils();
  const { data: caseStudies, isLoading } = trpc.caseStudies.all.useQuery();
  const createMutation = trpc.caseStudies.create.useMutation();
  const updateMutation = trpc.caseStudies.update.useMutation();
  const deleteMutation = trpc.caseStudies.delete.useMutation();
  const seedMutation = trpc.caseStudies.seed.useMutation();
  const uploadImageMutation = trpc.caseStudies.uploadImage.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      if (editingStudy) {
        await updateMutation.mutateAsync({
          id: editingStudy.id,
          updates: formData,
        });
        toast.success("Case study updated successfully!");
        setShowForm(false);
        resetForm();
        utils.invalidate("caseStudies.all");
        setIsSubmitting(false);
        return;
      }

      const slug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      await createMutation.mutateAsync({
        ...formData,
        slug,
      });

      toast.success("Case study created successfully!");
      setShowForm(false);
      resetForm();
      utils.invalidate("caseStudies.all");
      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create case study");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    setDeletingId(id);

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Case study deleted successfully!");
      utils.invalidate("caseStudies.all");
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete case study");
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      clientName: "",
      clientLogo: "",
      industry: "",
      serviceType: "",
      challenge: "",
      solution: "",
      results: "",
      testimonial: "",
      testimonialAuthor: "",
      testimonialRole: "",
      imageUrl: "",
      featured: false,
    });
    setEditingStudy(null);
  };

  const handleEdit = (study: any) => {
    setEditingStudy(study);
    setFormData({
      title: study.title || "",
      slug: study.slug || "",
      clientName: study.clientName || "",
      clientLogo: study.clientLogo || "",
      industry: study.industry || "",
      serviceType: study.serviceType || "",
      challenge: study.challenge || "",
      solution: study.solution || "",
      results: study.results || "",
      testimonial: study.testimonial || "",
      testimonialAuthor: study.testimonialAuthor || "",
      testimonialRole: study.testimonialRole || "",
      imageUrl: study.imageUrl || "",
      featured: study.featured || false,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      // Create a preview URL first for better UX
      const previewUrl = URL.createObjectURL(file);

      const result = await uploadImageMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        dataUrl: previewUrl,
      });

      // Revoke the preview URL since we have the real URL now
      URL.revokeObjectURL(previewUrl);

      setFormData({ ...formData, imageUrl: result.url });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error?.message || "Failed to upload image. Please try again."
      );
    }
  };

  const filteredStudies = caseStudies?.filter(
    study =>
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.industry?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="font-bold text-gray-900">
                  Case Studies Management
                </h1>
                <p className="text-xs text-gray-600">
                  Create and manage case studies
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
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await seedMutation.mutateAsync();
                    toast.success(`Seeded ${result.inserted} case studies!`);
                    utils.invalidate("caseStudies.all");
                  } catch (error) {
                    toast.error("Failed to seed case studies");
                  }
                }}
                disabled={seedMutation.isLoading}
                className="rounded-full hover:bg-green-50 hover:border-green-200"
              >
                {seedMutation.isLoading ? "Seeding..." : "Seed Sample Data"}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
              >
                <Plus size={18} className="mr-2" />
                New Case Study
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
            placeholder="Search case studies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case studies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredStudies && filteredStudies.length > 0 ? (
                filteredStudies.map((study, idx) => (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group"
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-3xl">
                      {study.imageUrl && (
                        <div className="w-full h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={study.imageUrl}
                            alt={study.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {study.industry && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-2">
                                {study.industry}
                              </span>
                            )}
                            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                              {study.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {study.clientName}
                            </CardDescription>
                          </div>
                          {study.featured && (
                            <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {study.solution?.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(study)}
                            className="flex-1 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          >
                            <Edit2 size={14} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(study.id)}
                            disabled={deletingId === study.id}
                            className="flex-1 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-red-600"
                          >
                            {deletingId === study.id ? (
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No case studies found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by creating your first case study"}
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Case Study
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingStudy ? "Edit Case Study" : "Create New Case Study"}
            </DialogTitle>
            <DialogDescription>
              {editingStudy
                ? "Update the case study details below"
                : "Fill in the details to create a new case study"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter case study title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={e =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={e =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={e =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g., Healthcare, Finance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={e =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  placeholder="e.g., Document Localization"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="challenge">Challenge</Label>
                <Textarea
                  id="challenge"
                  value={formData.challenge}
                  onChange={e =>
                    setFormData({ ...formData, challenge: e.target.value })
                  }
                  placeholder="Describe the challenge the client faced"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={e =>
                    setFormData({ ...formData, solution: e.target.value })
                  }
                  placeholder="Describe how Solupedia solved the challenge"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={e =>
                    setFormData({ ...formData, results: e.target.value })
                  }
                  placeholder="Describe the results achieved"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Featured Image</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload size={18} />
                    {uploadImageMutation.isLoading
                      ? "Uploading..."
                      : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadImageMutation.isLoading}
                    />
                  </label>
                  {formData.imageUrl && (
                    <span className="text-sm text-green-600">
                      Image uploaded!
                    </span>
                  )}
                </div>
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="mt-2"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Client Logo</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                    <Upload size={18} />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select a valid image file");
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Logo must be less than 2MB");
                          return;
                        }
                        try {
                          const previewUrl = URL.createObjectURL(file);
                          const result = await uploadImageMutation.mutateAsync({
                            fileName: `logo-${file.name}`,
                            contentType: file.type,
                            dataUrl: previewUrl,
                          });
                          URL.revokeObjectURL(previewUrl);
                          setFormData({ ...formData, clientLogo: result.url });
                          toast.success("Logo uploaded successfully!");
                        } catch (error) {
                          console.error("Logo upload error:", error);
                          toast.error(
                            error?.message || "Failed to upload logo"
                          );
                        }
                      }}
                      className="hidden"
                      disabled={uploadImageMutation.isLoading}
                    />
                  </label>
                  {formData.clientLogo && (
                    <span className="text-sm text-green-600">
                      Logo uploaded!
                    </span>
                  )}
                </div>
                {formData.clientLogo && (
                  <div className="mt-4">
                    <img
                      src={formData.clientLogo}
                      alt="Client Logo Preview"
                      className="max-w-xs h-20 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, clientLogo: "" })
                      }
                      className="mt-2"
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial">Testimonial</Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial}
                  onChange={e =>
                    setFormData({ ...formData, testimonial: e.target.value })
                  }
                  placeholder="Client testimonial quote"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonialAuthor">Testimonial Author</Label>
                <Input
                  id="testimonialAuthor"
                  value={formData.testimonialAuthor}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      testimonialAuthor: e.target.value,
                    })
                  }
                  placeholder="Name of the person quoted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonialRole">Testimonial Author Role</Label>
                <Input
                  id="testimonialRole"
                  value={formData.testimonialRole}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      testimonialRole: e.target.value,
                    })
                  }
                  placeholder="Role/Title of the person"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={e =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured Case Study
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                    {editingStudy ? "Updating..." : "Creating..."}
                  </>
                ) : editingStudy ? (
                  "Update Case Study"
                ) : (
                  "Create Case Study"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
