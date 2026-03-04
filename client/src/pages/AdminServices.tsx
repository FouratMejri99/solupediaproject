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
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function AdminServices() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    icon: "BookOpen",
    orderIndex: 0,
    isPublished: true,
    image: "",
    keyFeatures: "",
    processSteps: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.services.list.useQuery();
  const createMutation = trpc.services.create.useMutation();
  const updateMutation = trpc.services.update.useMutation();
  const deleteMutation = trpc.services.delete.useMutation();
  const seedMutation = trpc.services.seed.useMutation();
  const uploadImageMutation = trpc.services.uploadImage.useMutation();
  const deleteImageMutation = trpc.services.deleteImage.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

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
      let imageUrl = formData.image;

      // Upload new image if selected
      if (selectedImage) {
        const slug =
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        setIsUploading(true);
        try {
          imageUrl = await uploadImageMutation.mutateAsync({
            file: selectedImage,
            serviceSlug: slug,
          });
          toast.success("Image uploaded successfully!");
        } catch (uploadError: any) {
          console.error("Upload error:", uploadError);
          toast.error(uploadError?.message || "Failed to upload image");
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const newOrder = formData.orderIndex || 0;

      if (editingService) {
        // Update existing service
        const oldOrder =
          editingService.orderIndex || editingService.orderindex || 0;

        // If order changed, auto-adjust other services
        if (oldOrder !== newOrder && services) {
          for (const s of services as any[]) {
            const sOrder = s.orderIndex || s.orderindex || 0;
            if (s.id === editingService.id) continue;

            let newSOrder = sOrder;
            if (newOrder > oldOrder) {
              // Moving down: shift items between old and new position up
              if (sOrder > oldOrder && sOrder <= newOrder) {
                newSOrder = sOrder - 1;
              }
            } else {
              // Moving up: shift items between new and old position down
              if (sOrder >= newOrder && sOrder < oldOrder) {
                newSOrder = sOrder + 1;
              }
            }

            if (newSOrder !== sOrder) {
              await updateMutation.mutateAsync({
                id: s.id,
                updates: { orderIndex: newSOrder },
              });
            }
          }
        }

        await updateMutation.mutateAsync({
          id: editingService.id,
          updates: { ...formData, image: imageUrl, orderIndex: newOrder },
        });
        toast.success("Service updated successfully!");
        setShowForm(false);
        resetForm();
        utils.invalidate("services.list");
        utils.invalidate("services.getBySlug");
        setIsSubmitting(false);
        return;
      }

      // Generate slug from name if not provided
      const slug =
        formData.slug ||
        formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      // Adjust orders for new service
      if (services && newOrder > 0) {
        for (const s of services as any[]) {
          const sOrder = s.orderIndex || s.orderindex || 0;
          if (sOrder >= newOrder) {
            await updateMutation.mutateAsync({
              id: s.id,
              updates: { orderIndex: sOrder + 1 },
            });
          }
        }
      }

      await createMutation.mutateAsync({
        ...formData,
        slug,
        image: imageUrl,
      });

      toast.success("Service created successfully!");
      setShowForm(false);
      resetForm();
      utils.invalidate("services.list");
      utils.invalidate("services.getBySlug");
      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create service");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setDeletingId(id);

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Service deleted successfully!");
      utils.invalidate("services.list");
      utils.invalidate("services.getBySlug");
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete service");
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      icon: "BookOpen",
      orderIndex: 0,
      isPublished: true,
      image: "",
      keyFeatures: "",
      processSteps: "",
    });
    setEditingService(null);
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openEditForm = (service: any) => {
    setEditingService(service);
    const serviceImage = service.image || "";
    setFormData({
      name: service.name || "",
      slug: service.slug || "",
      shortDescription:
        service.shortDescription || service.shortdescription || "",
      description: service.description || "",
      icon: service.icon || "BookOpen",
      orderIndex: service.orderIndex || service.orderindex || 0,
      isPublished: service.isPublished ?? service.ispublished ?? true,
      image: serviceImage,
      keyFeatures: service.keyFeatures || service.keyfeatures || "",
      processSteps: service.processSteps || service.processsteps || "",
    });
    setImagePreview(serviceImage);
    setSelectedImage(null);
    setShowForm(true);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Filter services based on search query
  const filteredServices = services?.filter(
    (service: any) =>
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Services Management
                </h1>
                <p className="text-gray-600">Add, edit, or remove services</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openNewForm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
              <Button
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    await seedMutation.mutateAsync({});
                    toast.success("Services seeded successfully!");
                    utils.invalidate("services.list");
                    utils.invalidate("services.getBySlug");
                  } catch (error: any) {
                    toast.error(error?.message || "Failed to seed services");
                  }
                  setIsSeeding(false);
                }}
                disabled={isSeeding}
                variant="outline"
              >
                {isSeeding ? "Seeding..." : "Seed Services"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No services found</p>
            <Button onClick={openNewForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredServices?.map((service: any, idx: number) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    {service.image && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {service.shortDescription}
                          </CardDescription>
                        </div>
                        {service.isPublished || service.ispublished ? (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Order:{" "}
                            {service.orderindex ?? service.orderIndex ?? 0}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(service)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            disabled={deletingId === service.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Service Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below"
                : "Fill in the details to create a new service"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., eLearning Engineering"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={e =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="e.g., elearning-engineering"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={e =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Brief description for cards"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Key Features</Label>
              <Textarea
                id="keyFeatures"
                value={formData.keyFeatures}
                onChange={e =>
                  setFormData({ ...formData, keyFeatures: e.target.value })
                }
                placeholder="Enter key features, one per line (e.g., Feature 1, Feature 2)"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Enter each feature on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processSteps">Process Steps</Label>
              <Textarea
                id="processSteps"
                value={formData.processSteps}
                onChange={e =>
                  setFormData({ ...formData, processSteps: e.target.value })
                }
                placeholder="Enter each step on a new line (e.g., Content Analysis)"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Enter each step on a new line
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={e =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="BookOpen, Video, Zap, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderIndex">Display Order</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      orderIndex: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Service Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {(imagePreview || formData.image) && !selectedImage ? (
                  <div className="relative">
                    <img
                      src={imagePreview || formData.image}
                      alt="Service preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFormData({ ...formData, image: "" });
                        setImagePreview("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : selectedImage ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      >
                        Click to upload an image
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={e =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish Service
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading
                  ? isUploading
                    ? "Uploading Image..."
                    : "Saving..."
                  : editingService
                    ? "Update Service"
                    : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
