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
import { serviceLayoutsService } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  Layout,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  ChevronRight,
  Folder,
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
  const createLayoutMutation = trpc.serviceLayouts.create.useMutation();
  const updateLayoutMutation = trpc.serviceLayouts.update.useMutation();
  const deleteLayoutMutation = trpc.serviceLayouts.delete.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Layout management state
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [selectedServiceForLayout, setSelectedServiceForLayout] = useState<any>(null);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);
  
  // Section management
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionFormData, setSectionFormData] = useState({
    sectionTitle: "",
    layoutType: 1,
    orderIndex: 0,
  });
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  
  // Item management (within a section)
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedSectionForItem, setSelectedSectionForItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemFormData, setItemFormData] = useState({
    itemNumber: 1,
    itemIcon: "",
    itemTitle: "",
    itemDescription: "",
    subItems: [] as string[],
    iconized: false,
    orderIndex: 0,
  });
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [deletingLayoutId, setDeletingLayoutId] = useState<number | null>(null);

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

  // Layout management functions
  const openLayoutDialog = async (service: any) => {
    setSelectedServiceForLayout(service);
    setShowLayoutDialog(true);
    setIsLoadingLayouts(true);
    try {
      const result = await serviceLayoutsService.getByServiceId(service.id);
      setLayouts(result || []);
    } catch (error) {
      console.error("Error loading layouts:", error);
      toast.error("Failed to load layouts");
    } finally {
      setIsLoadingLayouts(false);
    }
  };

  // Group layouts by section_title and layout_type
  const getSections = () => {
    const sections: { [key: string]: any } = {};
    layouts.forEach((layout: any) => {
      const key = layout.section_title || `section_${layout.id}`;
      if (!sections[key]) {
        sections[key] = {
          id: layout.id,
          sectionTitle: layout.section_title,
          layoutType: layout.layout_type || 1,
          orderIndex: layout.order_index,
          items: [],
        };
      }
      sections[key].items.push(layout);
    });
    return Object.values(sections).sort((a: any, b: any) => a.orderIndex - b.orderIndex);
  };

  const sections = getSections();

  // Section CRUD
  const openNewSectionForm = () => {
    setEditingSection(null);
    setSectionFormData({
      sectionTitle: "",
      layoutType: 1,
      orderIndex: sections.length,
    });
    setShowSectionDialog(true);
  };

  const openEditSectionForm = (section: any) => {
    setEditingSection(section);
    setSectionFormData({
      sectionTitle: section.sectionTitle || "",
      layoutType: section.layoutType || 1,
      orderIndex: section.orderIndex || 0,
    });
    setShowSectionDialog(true);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForLayout) return;
    setIsSubmittingSection(true);
    try {
      if (editingSection) {
        // Update section - update all items with this section title
        await updateLayoutMutation.mutateAsync({
          id: editingSection.id,
          updates: {
            sectionTitle: sectionFormData.sectionTitle,
            layoutType: sectionFormData.layoutType,
            orderIndex: sectionFormData.orderIndex,
          },
        });
        toast.success("Section updated!");
      } else {
        // Create new section - create one layout entry as section header
        await createLayoutMutation.mutateAsync({
          serviceId: selectedServiceForLayout.id,
          sectionTitle: sectionFormData.sectionTitle,
          layoutType: sectionFormData.layoutType,
          itemTitle: sectionFormData.sectionTitle,
          itemNumber: 1,
          orderIndex: sectionFormData.orderIndex,
          isSection: true,
        });
        toast.success("Section created!");
      }
      setShowSectionDialog(false);
      // Reload layouts
      const result = await serviceLayoutsService.getByServiceId(selectedServiceForLayout.id);
      setLayouts(result || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save section");
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleDeleteSection = async (section: any) => {
    if (!confirm(`Are you sure you want to delete section "${section.sectionTitle}" and all its items?`)) return;
    try {
      // Delete all items in this section
      for (const item of section.items) {
        await deleteLayoutMutation.mutateAsync(item.id);
      }
      toast.success("Section deleted!");
      // Reload layouts
      if (selectedServiceForLayout) {
        const result = await serviceLayoutsService.getByServiceId(selectedServiceForLayout.id);
        setLayouts(result || []);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete section");
    }
  };

  // Item CRUD
  const openNewItemForm = (section: any) => {
    setSelectedSectionForItem(section);
    setEditingItem(null);
    setItemFormData({
      itemNumber: section.items.length + 1,
      itemIcon: "",
      itemTitle: "",
      itemDescription: "",
      subItems: [],
      iconized: false,
      orderIndex: section.items.length,
    });
    setShowItemDialog(true);
  };

  const openEditItemForm = (item: any, section: any) => {
    setSelectedSectionForItem(section);
    setEditingItem(item);
    // Parse sub_items
    let parsedSubItems: string[] = [];
    if (item.sub_items) {
      try {
        parsedSubItems = typeof item.sub_items === 'string' 
          ? JSON.parse(item.sub_items) 
          : item.sub_items;
      } catch (e) {
        parsedSubItems = [];
      }
    }
    setItemFormData({
      itemNumber: item.item_number || 1,
      itemIcon: item.item_icon || "",
      itemTitle: item.item_title || "",
      itemDescription: item.item_description || "",
      subItems: parsedSubItems,
      iconized: item.iconized || false,
      orderIndex: item.order_index || 0,
    });
    setShowItemDialog(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForLayout || !selectedSectionForItem) return;
    setIsSubmittingItem(true);
    try {
      if (editingItem) {
        await updateLayoutMutation.mutateAsync({
          id: editingItem.id,
          updates: {
            sectionTitle: selectedSectionForItem.sectionTitle,
            layoutType: selectedSectionForItem.layoutType,
            itemNumber: itemFormData.itemNumber,
            itemIcon: itemFormData.itemIcon,
            itemTitle: itemFormData.itemTitle,
            itemDescription: itemFormData.itemDescription,
            subItems: JSON.stringify(itemFormData.subItems),
            iconized: itemFormData.iconized,
            orderIndex: itemFormData.orderIndex,
          },
        });
        toast.success("Item updated!");
      } else {
        await createLayoutMutation.mutateAsync({
          serviceId: selectedServiceForLayout.id,
          sectionTitle: selectedSectionForItem.sectionTitle,
          layoutType: selectedSectionForItem.layoutType,
          itemNumber: itemFormData.itemNumber,
          itemIcon: itemFormData.itemIcon,
          itemTitle: itemFormData.itemTitle,
          itemDescription: itemFormData.itemDescription,
          subItems: JSON.stringify(itemFormData.subItems),
          iconized: itemFormData.iconized,
          orderIndex: itemFormData.orderIndex,
        });
        toast.success("Item added!");
      }
      setShowItemDialog(false);
      // Reload layouts
      const result = await serviceLayoutsService.getByServiceId(selectedServiceForLayout.id);
      setLayouts(result || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save item");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingLayoutId(itemId);
    try {
      await deleteLayoutMutation.mutateAsync(itemId);
      toast.success("Item deleted!");
      // Reload layouts
      if (selectedServiceForLayout) {
        const result = await serviceLayoutsService.getByServiceId(selectedServiceForLayout.id);
        setLayouts(result || []);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete item");
    } finally {
      setDeletingLayoutId(null);
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
                  } catch (error) {
                    toast.error("Failed to seed services");
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                variant="outline"
                disabled={isSeeding}
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found</p>
            <Button onClick={openNewForm} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices?.map((service: any) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  {service.image && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {service.shortDescription || service.shortdescription}
                        </CardDescription>
                      </div>
                      {!service.isPublished && !service.ispublished && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(service.keyFeatures || service.keyfeatures || "")
                        .split("\n")
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((feature: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(service)}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLayoutDialog(service)}
                        className="flex-1"
                      >
                        <Layout className="w-4 h-4 mr-2" />
                        Layouts
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
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

      {/* Service Layouts Dialog */}
      <Dialog open={showLayoutDialog} onOpenChange={setShowLayoutDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Layouts - {selectedServiceForLayout?.name}
            </DialogTitle>
            <DialogDescription>
              Create sections and add items to each section
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              onClick={openNewSectionForm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Section
            </Button>

            {isLoadingLayouts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading layouts...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No sections yet</p>
                <p className="text-sm text-gray-400">
                  Click "Add New Section" to create your first section
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section: any, sectionIndex: number) => (
                  <div
                    key={sectionIndex}
                    className="border rounded-lg p-4 bg-white"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Type {section.layoutType}
                        </span>
                        <h3 className="font-semibold text-lg">
                          {section.sectionTitle || "Untitled Section"}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openNewItemForm(section)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSectionForm(section)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSection(section)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Section Items */}
                    {section.items && section.items.length > 0 ? (
                      <div className="space-y-3">
                        {section.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {item.item_number && (
                                  <span className="text-lg font-semibold text-gray-500">
                                    {item.item_number}.
                                  </span>
                                )}
                                <span className="font-medium">
                                  {item.item_title}
                                </span>
                              </div>
                              {item.item_description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {item.item_description}
                                </p>
                              )}
                              {item.sub_items && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {Array.isArray(item.sub_items)
                                    ? `${item.sub_items.length} sub-items`
                                    : typeof item.sub_items === "string"
                                    ? `${JSON.parse(item.sub_items).length} sub-items`
                                    : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditItemForm(item, section)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={deletingLayoutId === item.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No items in this section. Click "Add Item" to add one.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Form Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Section" : "Add New Section"}
            </DialogTitle>
            <DialogDescription>
              Choose the layout type for this section
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Section Title</Label>
              <Input
                id="sectionTitle"
                value={sectionFormData.sectionTitle}
                onChange={e =>
                  setSectionFormData({
                    ...sectionFormData,
                    sectionTitle: e.target.value,
                  })
                }
                placeholder="e.g., Our Process, Benefits, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Layout Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSectionFormData({ ...sectionFormData, layoutType: 1 })
                  }
                  className={`p-3 border rounded-lg text-sm text-center transition-colors ${
                    sectionFormData.layoutType === 1
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Type 1</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Title + Number + Description
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSectionFormData({ ...sectionFormData, layoutType: 2 })
                  }
                  className={`p-3 border rounded-lg text-sm text-center transition-colors ${
                    sectionFormData.layoutType === 2
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Type 2</div>
                  <div className="text-xs text-gray-500 mt-1">Simple List</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSectionFormData({ ...sectionFormData, layoutType: 3 })
                  }
                  className={`p-3 border rounded-lg text-sm text-center transition-colors ${
                    sectionFormData.layoutType === 3
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Type 3</div>
                  <div className="text-xs text-gray-500 mt-1">With Sub-items</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSectionFormData({ ...sectionFormData, layoutType: 4 })
                  }
                  className={`p-3 border rounded-lg text-sm text-center transition-colors ${
                    sectionFormData.layoutType === 4
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Type 4</div>
                  <div className="text-xs text-gray-500 mt-1">Iconized List</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionOrderIndex">Display Order</Label>
              <Input
                id="sectionOrderIndex"
                type="number"
                min="0"
                value={sectionFormData.orderIndex}
                onChange={e =>
                  setSectionFormData({
                    ...sectionFormData,
                    orderIndex: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSectionDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmittingSection}
              >
                {isSubmittingSection
                  ? "Saving..."
                  : editingSection
                  ? "Update Section"
                  : "Create Section"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Form Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add Item"} -{" "}
              {selectedSectionForItem?.sectionTitle}
            </DialogTitle>
            <DialogDescription>
              Layout Type: {selectedSectionForItem?.layoutType}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            {/* Layout Type 1 & 2: Number + Title + Description */}
            {(selectedSectionForItem?.layoutType === 1 ||
              selectedSectionForItem?.layoutType === 2) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemNumber">Item Number</Label>
                    <Input
                      id="itemNumber"
                      type="number"
                      min="1"
                      value={itemFormData.itemNumber}
                      onChange={e =>
                        setItemFormData({
                          ...itemFormData,
                          itemNumber: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemIcon">Icon Name</Label>
                    <Input
                      id="itemIcon"
                      value={itemFormData.itemIcon}
                      onChange={e =>
                        setItemFormData({
                          ...itemFormData,
                          itemIcon: e.target.value,
                        })
                      }
                      placeholder="e.g., CheckCircle"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemTitle">Item Title *</Label>
                  <Input
                    id="itemTitle"
                    value={itemFormData.itemTitle}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        itemTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Expert Team"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Item Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={itemFormData.itemDescription}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        itemDescription: e.target.value,
                      })
                    }
                    placeholder="Describe this item..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Layout Type 3: Title + Sub Items */}
            {selectedSectionForItem?.layoutType === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="itemTitle">Item Title *</Label>
                  <Input
                    id="itemTitle"
                    value={itemFormData.itemTitle}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        itemTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Our Approach"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub Items</Label>
                  <div className="space-y-2">
                    {itemFormData.subItems.map((subItem, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={subItem}
                          onChange={e => {
                            const newSubItems = [...itemFormData.subItems];
                            newSubItems[index] = e.target.value;
                            setItemFormData({
                              ...itemFormData,
                              subItems: newSubItems,
                            });
                          }}
                          placeholder={`Sub-item ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSubItems = itemFormData.subItems.filter(
                              (_, i) => i !== index
                            );
                            setItemFormData({
                              ...itemFormData,
                              subItems: newSubItems,
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setItemFormData({
                          ...itemFormData,
                          subItems: [...itemFormData.subItems, ""],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sub Item
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Layout Type 4: Title + Description + Iconized Sub Items */}
            {selectedSectionForItem?.layoutType === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="itemTitle">Item Title *</Label>
                  <Input
                    id="itemTitle"
                    value={itemFormData.itemTitle}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        itemTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Key Features"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Item Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={itemFormData.itemDescription}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        itemDescription: e.target.value,
                      })
                    }
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub Items (Iconized)</Label>
                  <div className="space-y-2">
                    {itemFormData.subItems.map((subItem, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={subItem}
                          onChange={e => {
                            const newSubItems = [...itemFormData.subItems];
                            newSubItems[index] = e.target.value;
                            setItemFormData({
                              ...itemFormData,
                              subItems: newSubItems,
                            });
                          }}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSubItems = itemFormData.subItems.filter(
                              (_, i) => i !== index
                            );
                            setItemFormData({
                              ...itemFormData,
                              subItems: newSubItems,
                            });
                          }}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setItemFormData({
                          ...itemFormData,
                          subItems: [...itemFormData.subItems, ""],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sub Item
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="iconized"
                    checked={itemFormData.iconized}
                    onChange={e =>
                      setItemFormData({
                        ...itemFormData,
                        iconized: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="iconized" className="cursor-pointer">
                    Show icons for sub items
                  </Label>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="itemOrderIndex">Display Order</Label>
              <Input
                id="itemOrderIndex"
                type="number"
                min="0"
                value={itemFormData.orderIndex}
                onChange={e =>
                  setItemFormData({
                    ...itemFormData,
                    orderIndex: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowItemDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmittingItem}
              >
                {isSubmittingItem
                  ? "Saving..."
                  : editingItem
                  ? "Update Item"
                  : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
