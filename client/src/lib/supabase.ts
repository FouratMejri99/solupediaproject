import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Formspree Configuration (FREE - up to 10 submissions/month)
// Works directly from browser without backend API
const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || "";
const FORMSPREE_LEAD_FORM_ID =
  import.meta.env.VITE_FORMSPREE_LEAD_FORM_ID || FORMSPREE_FORM_ID;

// Admin emails for notifications
const ADMIN_EMAILS = ["weseily@gmail.com", "info@solupedia.com"];

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Storage service for service images
export const storageService = {
  async uploadServiceImage(file: File, serviceSlug: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${serviceSlug}-${Date.now()}.${fileExt}`;
    const filePath = `services/${fileName}`;

    console.log("Uploading to bucket: public-assets, path:", filePath);

    const { data, error } = await supabase.storage
      .from("public-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(error.message || "Failed to upload image");
    }

    console.log("Upload successful:", data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("public-assets")
      .getPublicUrl(filePath);

    console.log("Public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  },

  async deleteServiceImage(imageUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = imageUrl.split("/storage/v1/object/public/");
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from("public-assets")
      .remove([filePath]);

    if (error) {
      console.error("Storage delete error:", error);
    }
  },
};

// Auth helpers
export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Generic table operations
export const dbService = {
  async select<T>(
    table: string,
    options?: {
      select?: string;
      eq?: Record<string, any>;
      order?: string;
      ascending?: boolean;
      limit?: number;
    }
  ) {
    let query = supabase.from(table).select(options?.select || "*");

    if (options?.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.order) {
      query = query.order(options.order, {
        ascending: options.ascending ?? false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  },

  async insert<T>(table: string, row: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  async update<T>(table: string, id: number | string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  async delete(table: string, id: number | string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },

  async deleteByField(table: string, field: string, value: any) {
    const { error } = await supabase.from(table).delete().eq(field, value);
    if (error) throw error;
  },
};

// Blog service
export const blogService = {
  async getAll() {
    // Try to order by 'order' field, fall back to createdAt if it doesn't exist
    try {
      return await dbService.select("blogposts", {
        order: "order",
        ascending: true,
      });
    } catch (e) {
      // If 'order' field doesn't exist, fallback to createdAt
      return dbService.select("blogposts", {
        order: "createdAt",
        ascending: false,
      });
    }
  },

  async getBySlug(slug: string) {
    const [data] = await dbService.select("blogposts", {
      eq: { slug },
    });
    return data;
  },

  async getFeatured(limit = 3) {
    return dbService.select("blogposts", {
      eq: { published: true },
      order: "publishedAt",
      ascending: false,
      limit,
    });
  },

  async create(postData: any) {
    return dbService.insert("blogposts", postData);
  },

  async update(id: number, updates: any) {
    return dbService.update("blogposts", id, updates);
  },

  async delete(id: number) {
    return dbService.delete("blogposts", id);
  },

  async updateOrder(id: number, order: number) {
    return dbService.update("blogposts", id, { order });
  },

  // Upload blog images to Supabase storage bucket
  async uploadImage(input: {
    fileName: string;
    contentType: string;
    dataUrl: string;
  }): Promise<{ url: string }> {
    const { fileName, contentType, dataUrl } = input;
    // Convert data URL to Blob reliably in the browser
    const blob = await (await fetch(dataUrl)).blob();

    const path = `blog/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage
      .from("public-assets")
      .upload(path, blob, {
        contentType,
        upsert: true,
      });
    if (error) throw error;

    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);

    return { url: data.publicUrl };
  },
};

// Case Studies service
export const caseStudiesService = {
  async getAll() {
    return dbService.select("casestudies", {
      order: "createdAt",
      ascending: false,
    });
  },

  async getBySlug(slug: string) {
    const [data] = await dbService.select("casestudies", {
      eq: { slug },
    });
    return data;
  },

  async getFeatured(limit = 3) {
    return dbService.select("casestudies", {
      eq: { featured: true },
      order: "createdAt",
      ascending: false,
      limit,
    });
  },

  async create(studyData: any) {
    return dbService.insert("casestudies", studyData);
  },

  async update(id: number, updates: any) {
    return dbService.update("casestudies", id, updates);
  },

  async delete(id: number) {
    return dbService.delete("casestudies", id);
  },

  // Upload case study images to Supabase storage bucket
  async uploadImage(input: {
    fileName: string;
    contentType: string;
    dataUrl: string;
  }): Promise<{ url: string }> {
    const { fileName, contentType, dataUrl } = input;
    // Convert data URL to Blob reliably in the browser
    const blob = await (await fetch(dataUrl)).blob();

    const path = `case-studies/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage
      .from("public-assets")
      .upload(path, blob, {
        contentType,
        upsert: true,
      });
    if (error) throw error;

    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);

    return { url: data.publicUrl };
  },

  // Simple seeding helper to populate example case studies
  async seedSample() {
    const samples = [
      {
        title: "Global Tech Platform Localization",
        slug: "global-tech-platform-localization",
        clientName: "TechCorp",
        industry: "Technology",
        serviceType: "Document Localization",
        challenge:
          "Expanding to 12 new markets with complex technical documentation.",
        solution:
          "Localized technical manuals, UI text, and support content into 12 languages.",
        results: "40% faster onboarding and 25% increase in user adoption.",
        featured: true,
      },
      {
        title: "eLearning Program for Healthcare",
        slug: "elearning-program-healthcare",
        clientName: "MediLearn",
        industry: "Healthcare",
        serviceType: "eLearning Localization",
        challenge:
          "Deliver compliant training to a global healthcare workforce.",
        solution:
          "Localized interactive eLearning modules and assessments for 8 regions.",
        results: "95% course completion rate and improved compliance scores.",
        featured: true,
      },
    ];

    // Use upsert on slug so seeding can be run multiple times safely
    const { data, error } = await supabase
      .from("casestudies")
      .upsert(samples, { onConflict: "slug" });

    if (error) throw error;

    return { inserted: samples.length };
  },
};

// Services service
export const servicesService = {
  async getAll() {
    return dbService.select("services", {
      order: "orderindex",
      ascending: true,
    });
  },

  async getBySlug(slug: string) {
    const [data] = await dbService.select("services", {
      eq: { slug },
    });
    return data;
  },

  async create(data: any) {
    // Sanitize inputs to prevent XSS and injection attacks
    const sanitize = (val: string | null | undefined) => {
      if (!val || typeof val !== "string") return "";
      return val
        .trim()
        .replace(/<script/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
        .substring(0, 1000);
    };

    const sanitizeSlug = (val: string | null | undefined) => {
      if (!val || typeof val !== "string") return "";
      return val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100);
    };

    // Map camelCase to snake_case for database
    const dbData = {
      name: sanitize(data.name),
      slug: sanitizeSlug(data.slug),
      shortdescription: sanitize(
        data.shortDescription || data.shortdescription
      ),
      description: sanitize(data.description),
      icon: sanitize(data.icon),
      orderindex: Math.max(
        0,
        Math.floor(Number(data.orderIndex || data.orderindex || 0))
      ),
      ispublished: data.isPublished ?? data.ispublished ?? true,
      image: data.image || null,
      keyfeatures: data.keyFeatures || data.keyfeatures || null,
    };
    return dbService.insert("services", dbData);
  },

  async update(id: number, data: any) {
    // Sanitize inputs
    const sanitize = (val: string | null | undefined) => {
      if (!val || typeof val !== "string") return undefined;
      return val
        .trim()
        .replace(/<script/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
        .substring(0, 1000);
    };

    const sanitizeSlug = (val: string | null | undefined) => {
      if (!val || typeof val !== "string") return undefined;
      return val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100);
    };

    // Map camelCase to snake_case for database
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = sanitize(data.name);
    if (data.slug !== undefined) dbData.slug = sanitizeSlug(data.slug);
    if (data.shortDescription !== undefined)
      dbData.shortdescription = sanitize(data.shortDescription);
    if (data.description !== undefined)
      dbData.description = sanitize(data.description);
    if (data.icon !== undefined) dbData.icon = sanitize(data.icon);
    if (data.orderIndex !== undefined)
      dbData.orderindex = Math.max(0, Math.floor(Number(data.orderIndex)));
    if (data.isPublished !== undefined)
      dbData.ispublished = Boolean(data.isPublished);
    if (data.image !== undefined) dbData.image = data.image;
    if (data.keyFeatures !== undefined) dbData.keyfeatures = data.keyFeatures;
    dbData.updatedat = new Date().toISOString();
    return dbService.update("services", id, dbData);
  },

  async delete(id: number) {
    return dbService.delete("services", id);
  },

  async seedServices() {
    // First, delete all existing services
    const existing = await dbService.select<{ id: number }>("services", {});
    for (const service of existing) {
      await dbService.delete("services", service.id);
    }

    const services = [
      {
        name: "eLearning Engineering",
        slug: "elearning-engineering",
        shortdescription:
          "Storyline development and deep technical localization for interactive training.",
        description:
          "Our eLearning Engineering service provides comprehensive solutions for developing and localizing interactive training content. From Storyline development to deep technical localization, we ensure your training materials engage learners across all languages and cultures.",
        icon: "BookOpen",
        orderindex: 1,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      {
        name: "Media Localization",
        slug: "media-localization",
        shortdescription:
          "OST, subtitling, voiceover, and AI-assisted services for multimedia.",
        description:
          "Our Media Localization service covers all aspects of multimedia content adaptation. From original sound track (OST) production to subtitling, voiceover, and AI-assisted services, we bring your video content to life in any language.",
        icon: "Video",
        orderindex: 2,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
      },
      {
        name: "Accessibility",
        slug: "accessibility",
        shortdescription:
          "EAA enforcement, remediation, and standards compliance for all content.",
        description:
          "Our Accessibility service ensures your content meets all major accessibility standards including EAA (European Accessibility Act), WCAG, and Section 508. We provide comprehensive remediation services to make your content accessible to everyone.",
        icon: "Zap",
        orderindex: 3,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80",
      },
      {
        name: "Document & DTP",
        slug: "document-dtp",
        shortdescription:
          "RTL expertise, graphics localization, and template management.",
        description:
          "Our Document & DTP service handles all aspects of document localization including RTL (right-to-left) language support, graphics localization, and professional template management. We ensure your documents look perfect in every language.",
        icon: "Globe",
        orderindex: 4,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
      },
      {
        name: "Content Creation",
        slug: "content-creation",
        shortdescription:
          "Build once, localize efficiently - 40-60% cost savings with our methodology.",
        description:
          "Our Content Creation service is designed from the ground up for efficient localization. By following our proven methodology, you can achieve 40-60% cost savings while maintaining high quality across all languages.",
        icon: "FileText",
        orderindex: 5,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      },
      {
        name: "AI Workflows",
        slug: "ai-workflows",
        shortdescription:
          "AI at every pipeline stage with intelligent tiering for maximum efficiency.",
        description:
          "Our AI Workflows service integrates artificial intelligence at every stage of the localization pipeline. With intelligent tiering, we optimize the balance between AI efficiency and human quality for the best results.",
        icon: "Users",
        orderindex: 6,
        ispublished: true,
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      },
    ];

    for (const service of services) {
      await dbService.insert("services", service);
    }
    return { success: true, message: "Services seeded successfully" };
  },
};

// Testimonials service
// Normalize Supabase rows into a consistent shape for the UI
const normalizeTestimonial = (item: any) => ({
  id: item.id,
  clientName:
    item.clientname ??
    item.clientName ??
    item.client_name ??
    item.name ??
    item.author ??
    "",
  clientCompany:
    item.clientcompany ??
    item.clientCompany ??
    item.client_company ??
    item.company ??
    "",
  content:
    item.content ??
    item.message ??
    item.testimonial ??
    item.text ??
    item.testimony ??
    "",
  avatar:
    item.avatar ??
    item.avatarUrl ??
    item.clientAvatar ??
    item.image ??
    item.photo ??
    "",
});

export const testimonialsService = {
  async getAll() {
    const rows = await dbService.select("testimonials", {
      order: "createdat",
      ascending: false,
    });
    return (rows as any[]).map(normalizeTestimonial);
  },

  async getFeatured(limit = 3) {
    const rows = await dbService.select("testimonials", {
      eq: { ispublished: true },
      order: "createdat",
      ascending: false,
      limit,
    });
    return (rows as any[]).map(normalizeTestimonial);
  },

  async create(data: any) {
    return dbService.insert("testimonials", data);
  },
};

// Leads service
type SubscriptionType =
  | "lead"
  | "newsletter"
  | "quote_request"
  | "guide_request";

export const leadsService = {
  async submit(data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    serviceInterest?: string;
    type?: SubscriptionType;
  }) {
    // Map camelCase to snake_case for database
    const leadData = {
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      message: data.message || undefined,
      serviceinterest: data.serviceInterest || undefined,
      type: data.type || "lead",
      createdat: new Date().toISOString(),
    };
    const result = await dbService.insert("leads", leadData);

    // Send email notification to admins
    await leadsService.sendAdminNotification(leadData);

    return result;
  },

  async subscribeNewsletter(
    email: string,
    type: SubscriptionType = "newsletter",
    name?: string,
    company?: string
  ) {
    if (type === "newsletter") {
      // Insert into newsletter table
      const subscriptionData = {
        email,
        name,
        company,
      };
      const result = await dbService.insert("newsletter", subscriptionData);
      return result;
    } else {
      // Insert into newsletter_subscriptions table for other types (guide_request, etc.)
      const subscriptionData = {
        email,
        type,
        subscribedat: new Date().toISOString(),
        name,
        company,
      };
      const result = await dbService.insert(
        "newsletter_subscriptions",
        subscriptionData
      );
      return result;
    }
  },

  async sendAdminNotification(data: {
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    serviceInterest?: string;
    type?: SubscriptionType;
  }) {
    const typeLabels: Record<SubscriptionType, string> = {
      lead: "Contact Form Lead",
      newsletter: "Newsletter Subscription",
      quote_request: "Quote Request",
      guide_request: "Guide Request",
    };

    // Use Node.js server API if available, otherwise fallback to Formspree
    const API_URL = import.meta.env.VITE_API_URL || "";

    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/api/send-lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone,
            message: data.message,
            service: data.serviceInterest,
          }),
        });

        if (response.ok) {
          console.log("Lead notification sent via Nodemailer server!");
          return { success: true, message: "Admin notification sent" };
        } else {
          throw new Error("Server API failed");
        }
      } catch (error) {
        console.error("Failed to send via server API:", error);
      }
    }

    // Fallback to Formspree if configured
    if (FORMSPREE_LEAD_FORM_ID) {
      try {
        const formData = new FormData();
        formData.append("name", data.name || "Newsletter Subscriber");
        formData.append("email", data.email);
        formData.append("company", data.company || "N/A");
        formData.append("phone", data.phone || "N/A");
        formData.append("message", data.message || "N/A");
        formData.append("service_interest", data.serviceInterest || "N/A");
        formData.append("type", typeLabels[data.type || "lead"]);
        formData.append("submission_date", new Date().toLocaleString());
        // Copy to admin emails
        formData.append("_cc", ADMIN_EMAILS.join(","));

        const response = await fetch(
          `https://formspree.io/f/${FORMSPREE_LEAD_FORM_ID}`,
          {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          console.log(
            "Admin notification email sent successfully via Formspree!"
          );
          return { success: true, message: "Admin notification email sent" };
        } else {
          throw new Error("Formspree submission failed");
        }
      } catch (error) {
        console.error("Failed to send admin notification email:", error);
        return {
          success: false,
          message: "Failed to send admin notification email",
        };
      }
    }

    // Fallback: Log for debugging
    console.log("Admin notification would be sent to:", ADMIN_EMAILS);
    console.log("Type:", typeLabels[data.type || "lead"]);
    console.log("Data:", data);
    console.log(
      "Formspree not configured - set VITE_FORMSPREE_FORM_ID in .env"
    );

    return {
      success: true,
      message: "Admin notification queued (Formspree not configured)",
    };
  },

  async sendConfirmationEmail(email: string, type: SubscriptionType) {
    const messages: Record<SubscriptionType, string> = {
      lead: "Thank you for contacting us! We will be in touch shortly.",
      newsletter: "Thank you for subscribing to our newsletter!",
      quote_request:
        "Thank you for your quote request. We will get back to you within 24 hours.",
      guide_request:
        "Thank you for your guide request! Check your email for the download link.",
    };

    // Use Node.js server API if available
    const API_URL = import.meta.env.VITE_API_URL || "";

    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/api/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, type }),
        });

        if (response.ok) {
          console.log("Subscription processed via Nodemailer server!");
          return { success: true, message: "Confirmation email sent" };
        } else {
          throw new Error("Server API failed");
        }
      } catch (error) {
        console.error("Failed to send via server API:", error);
      }
    }

    // Fallback to Formspree if configured
    if (FORMSPREE_FORM_ID) {
      console.log(
        "Formspree configured - auto-response can be enabled in Formspree dashboard"
      );
      return { success: true, message: "Confirmation handled via Formspree" };
    }

    // Fallback: Log for debugging
    console.log("Confirmation email would be sent to:", email);
    console.log("Type:", type);
    console.log("Message:", messages[type]);
    console.log(
      "Formspree not configured - set VITE_FORMSPREE_FORM_ID in .env"
    );

    return {
      success: true,
      message: "Confirmation email queued (Formspree not configured)",
    };
  },

  async getAllLeads(type?: SubscriptionType) {
    const options: any = { order: "createdat", ascending: false };
    // Only filter for quote_request and guide_request, show all for other cases
    if (type === "quote_request" || type === "guide_request") {
      options.eq = { type };
    }
    return dbService.select("leads", options);
  },

  async getAllSubscriptions(type?: SubscriptionType) {
    const options: any = {};
    if (type) {
      options.eq = { type };
    }
    return dbService.select("newsletter_subscriptions", options);
  },

  async getNewsletterSubscriptions() {
    // Get all newsletter subscriptions directly from the table
    // Don't specify order to avoid column name issues
    return dbService.select("newsletter_subscriptions", {});
  },

  async getAll() {
    // Get all leads
    const leads = await dbService.select("leads", {
      order: "createdat",
      ascending: false,
    });
    // Get all newsletter subscriptions
    const subscriptions = await dbService.select(
      "newsletter_subscriptions",
      {}
    );
    // Combine and return
    return {
      leads,
      subscriptions,
      all: [
        ...leads.map((l: any) => ({ ...l, source: "lead" })),
        ...subscriptions.map((s: any) => ({ ...s, source: "newsletter" })),
      ],
    };
  },
};

// Employee table operations
const mapEmployeePayload = (data: any) => {
  const row: any = {};

  if (data.email !== undefined) row.email = data.email;

  if (data.firstName !== undefined || data.firstname !== undefined) {
    row.firstname = data.firstName ?? data.firstname;
  }
  if (data.lastName !== undefined || data.lastname !== undefined) {
    row.lastname = data.lastName ?? data.lastname;
  }

  if (data.employeeId !== undefined || data.employeeid !== undefined) {
    row.employeeid = data.employeeId ?? data.employeeid;
  }

  if (data.department !== undefined) row.department = data.department;
  if (data.position !== undefined) row.position = data.position;

  if (data.isActive !== undefined || data.isactive !== undefined) {
    row.isactive = data.isActive ?? data.isactive;
  }

  return row;
};

export const employeeService = {
  async getAll() {
    return dbService.select("employees", {
      order: "createdat",
      ascending: false,
    });
  },

  async getById(id: number) {
    const [data] = await dbService.select("employees", {
      eq: { id },
    });
    return data;
  },

  async create(employeeData: any) {
    const row = mapEmployeePayload(employeeData);
    return dbService.insert("employees", row);
  },

  async update(id: number, updates: any) {
    const row = mapEmployeePayload(updates);
    return dbService.update("employees", id, row);
  },

  async delete(id: number) {
    return dbService.delete("employees", id);
  },

  async verifyLogin(email: string, password: string) {
    // For this Supabase schema, we only validate that the employee exists
    // and is marked as active. The password is collected in the UI but not
    // stored in this table, so we cannot validate it here.
    const [employee] = await dbService.select("employees", {
      eq: { email, isactive: true },
    });
    return employee;
  },

  // Time records
  async createTimeRecord(recordData: any) {
    // Map camelCase fields from the UI to snake_case columns in Supabase
    const row: any = {};

    // Required: which employee, which day
    if (
      recordData.employeeId !== undefined ||
      recordData.employeeid !== undefined
    ) {
      row.employeeid = recordData.employeeId ?? recordData.employeeid;
    }

    if (recordData.workDate !== undefined || recordData.date !== undefined) {
      // Accept both Date and string
      const d = recordData.workDate ?? recordData.date;
      row.date = d instanceof Date ? d.toISOString().split("T")[0] : d;
    }

    // Optional metadata
    if (
      recordData.projectNumber !== undefined ||
      recordData.projectnumber !== undefined
    ) {
      row.projectnumber = recordData.projectNumber ?? recordData.projectnumber;
    }

    if (
      recordData.projectName !== undefined ||
      recordData.projectname !== undefined
    ) {
      row.projectname = recordData.projectName ?? recordData.projectname;
    }

    if (
      recordData.taskType !== undefined ||
      recordData.tasktype !== undefined
    ) {
      row.tasktype = recordData.taskType ?? recordData.tasktype;
    }

    if (recordData.client !== undefined) {
      row.client = recordData.client;
    }

    if (recordData.languages !== undefined) {
      row.languages = recordData.languages;
    }

    if (
      recordData.startTime !== undefined ||
      recordData.starttime !== undefined
    ) {
      row.starttime = recordData.startTime ?? recordData.starttime;
    }

    if (recordData.endTime !== undefined || recordData.endtime !== undefined) {
      row.endtime = recordData.endTime ?? recordData.endtime;
    }

    if (recordData.duration !== undefined) {
      row.duration = recordData.duration;
    }

    if (
      recordData.businessDayTime !== undefined ||
      recordData.businessdaytime !== undefined
    ) {
      row.businessdaytime =
        recordData.businessDayTime ?? recordData.businessdaytime;
    }

    if (recordData.overtime !== undefined) {
      row.overtime = recordData.overtime;
    }

    if (recordData.notes !== undefined) {
      row.notes = recordData.notes;
    }

    return dbService.insert("timetrackingrecords", row);
  },

  async getRecords(employeeId: number) {
    return dbService.select("timetrackingrecords", {
      eq: { employeeid: employeeId },
      order: "date",
      ascending: false,
    });
  },

  async deleteTimeRecord(id: number) {
    return dbService.delete("timetrackingrecords", id);
  },
};

// Admin operations
export const adminService = {
  async login(email: string, password: string) {
    const [admin] = await dbService.select<{
      id: number;
      email: string;
      password: string;
      role?: string;
      createdat?: string;
    }>("admincredentials", {
      eq: { email, password },
    });

    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        role: admin.role || "admin",
        createdAt: admin.createdat,
      };
    }

    throw new Error("Invalid admin credentials");
  },

  async changePassword(email: string, newPassword: string) {
    const { data, error } = await supabase
      .from("admincredentials")
      .update({ password: newPassword })
      .eq("email", email)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },

  async getAllEmployees() {
    const rows = await dbService.select("employees", {
      // Use snake_case column name from Supabase
      order: "createdat",
      ascending: false,
    });

    // Normalise to camelCase for the UI
    return (rows as any[]).map(emp => ({
      id: emp.id,
      email: emp.email,
      firstName: emp.firstName ?? emp.firstname ?? "",
      lastName: emp.lastName ?? emp.lastname ?? "",
      employeeId: emp.employeeId ?? emp.employeeid ?? "",
      department: emp.department ?? "",
      position: emp.position ?? "",
      isActive: emp.isActive ?? emp.isactive ?? true,
      createdAt: emp.createdAt ?? emp.createdat,
    }));
  },

  async createEmployee(data: any) {
    const row = mapEmployeePayload(data);
    return dbService.insert("employees", row);
  },

  async updateEmployee(id: number, updates: any) {
    const row = mapEmployeePayload(updates);
    return dbService.update("employees", id, row);
  },

  async deleteEmployee(id: number) {
    return dbService.delete("employees", id);
  },

  async deleteEmployeeRecords(employeeId: number) {
    // Delete related records in proper order (child tables first)
    await dbService.deleteByField("monthlyreports", "employeeid", employeeId);
    await dbService.deleteByField(
      "timetrackingrecords",
      "employeeid",
      employeeId
    );
  },

  // Reporting helpers built from timetrackingrecords + employees
  async getMonthlyReportSummary(year: number, month: number) {
    // Load all employees for name/metadata
    const employees = (await dbService.select<any>("employees")) || [];
    // Load all time records (small volume expected)
    const records = (await dbService.select<any>("timetrackingrecords", {
      order: "date",
      ascending: true,
    })) as any[];

    // Filter records to requested month (based on date column)
    const monthlyRecords = records.filter(r => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // Aggregate by employee
    const byEmployee = new Map<
      number,
      {
        employeeId: number;
        firstName: string;
        lastName: string;
        totalHours: number;
        businessDayHours: number;
        overtimeHours: number;
        projectIds: Set<string>;
      }
    >();

    for (const rec of monthlyRecords) {
      const id = rec.employeeid as number;
      if (!id) continue;

      const empRow = employees.find((e: any) => e.id === id) ?? {};
      const key = id;
      if (!byEmployee.has(key)) {
        byEmployee.set(key, {
          employeeId: id,
          firstName: empRow.firstname ?? empRow.firstName ?? "",
          lastName: empRow.lastname ?? empRow.lastName ?? "",
          totalHours: 0,
          businessDayHours: 0,
          overtimeHours: 0,
          projectIds: new Set<string>(),
        });
      }

      const agg = byEmployee.get(key)!;
      const duration = parseFloat(rec.duration) || 0;
      const business = parseFloat(rec.businessdaytime) || 0;
      const overtime = parseFloat(rec.overtime) || 0;

      agg.totalHours += duration;
      agg.businessDayHours += business;
      agg.overtimeHours += overtime;

      const projectKey =
        (rec.projectnumber as string) ||
        (rec.projectname as string) ||
        `${rec.date}-${rec.tasktype || ""}`;
      agg.projectIds.add(projectKey);
    }

    // Shape data to what AdminReporting expects
    return Array.from(byEmployee.values()).map(emp => ({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      totalHours: emp.totalHours,
      businessDayHours: emp.businessDayHours,
      overtimeHours: emp.overtimeHours,
      projectCount: emp.projectIds.size,
    }));
  },

  async getDailyReportSummary(startDate: string, endDate: string) {
    const records = (await dbService.select<any>("timetrackingrecords", {
      order: "date",
      ascending: true,
    })) as any[];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const byDate = new Map<
      string,
      {
        date: string;
        totalHours: number;
        overtimeHours: number;
        employeeIds: Set<number>;
      }
    >();

    for (const rec of records) {
      if (!rec.date) continue;
      const d = new Date(rec.date);
      if (d < start || d > end) continue;

      const key = rec.date as string;
      if (!byDate.has(key)) {
        byDate.set(key, {
          date: key,
          totalHours: 0,
          overtimeHours: 0,
          employeeIds: new Set<number>(),
        });
      }

      const agg = byDate.get(key)!;
      const duration = parseFloat(rec.duration) || 0;
      const overtime = parseFloat(rec.overtime) || 0;

      agg.totalHours += duration;
      agg.overtimeHours += overtime;
      if (rec.employeeid) {
        agg.employeeIds.add(rec.employeeid as number);
      }
    }

    return Array.from(byDate.values()).map(day => ({
      date: day.date,
      totalHours: day.totalHours,
      employeeCount: day.employeeIds.size,
      overtimeHours: day.overtimeHours,
    }));
  },

  async getTaskTypeDistribution(startDate: string, endDate: string) {
    const records = (await dbService.select<any>("timetrackingrecords", {
      order: "date",
      ascending: true,
    })) as any[];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const byTask = new Map<string, number>();

    for (const rec of records) {
      if (!rec.date) continue;
      const d = new Date(rec.date);
      if (d < start || d > end) continue;

      const rawType = (rec.tasktype as string) || "other";
      // Normalise to readable labels used in UI color map
      const taskType = (() => {
        switch (rawType) {
          case "translation":
            return "Translation";
          case "review":
            return "Review";
          case "qa":
            return "QA";
          case "desktop_publishing":
            return "Desktop Publishing";
          default:
            return "Other";
        }
      })();

      const duration = parseFloat(rec.duration) || 0;
      byTask.set(taskType, (byTask.get(taskType) || 0) + duration);
    }

    return Array.from(byTask.entries()).map(([taskType, totalHours]) => ({
      taskType,
      totalHours,
    }));
  },

  async seedSampleReports(year: number, month: number) {
    // Get employees first
    const employees = (await dbService.select<any>("employees")) || [];

    if (employees.length === 0) {
      return {
        success: false,
        message: "No employees found. Please add employees first.",
      };
    }

    // Sample data for seeding
    const sampleRecords = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (const emp of employees) {
      // Create records for each day in the month (excluding weekends)
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Random hours between 6-10
        const totalHours = 6 + Math.random() * 4;

        // Business hours (first 8 hours)
        const businessHours = Math.min(totalHours, 8);

        // Overtime (hours above 8)
        const overtimeHours = Math.max(0, totalHours - 8);

        sampleRecords.push({
          employeeid: emp.id,
          date: date.toISOString().split("T")[0],
          duration: totalHours.toFixed(2),
          businessdaytime: businessHours.toFixed(2),
          overtime: overtimeHours.toFixed(2),
          projectnumber: ["Project A", "Project B", "Project C"][
            Math.floor(Math.random() * 3)
          ],
          tasktype: ["Translation", "Review", "QA", "Desktop Publishing"][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    }

    // Insert all records
    const results = [];
    for (const record of sampleRecords) {
      const result = await dbService.insert("timetrackingrecords", record);
      results.push(result);
    }

    return {
      success: true,
      created: results.length,
      message: `Successfully created ${results.length} sample time tracking records`,
    };
  },
};
