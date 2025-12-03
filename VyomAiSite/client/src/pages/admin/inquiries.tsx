import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Trash2, Filter, Edit, Loader2 } from "lucide-react";
import { insertCustomerInquirySchema } from "@shared/schema";
import { z } from "zod";

const inquiryFormSchema = insertCustomerInquirySchema.extend({
  name: z.string().min(2, "Name required"),
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

export function InquiriesPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<any>(null);

  const { data: inquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      inquiryType: "contact",
      status: "new",
      phone: "",
      subject: "",
      company: "",
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("PUT", `/api/admin/inquiries/${editingInquiry?.id}`, data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Inquiry updated" });
      setIsDialogOpen(false);
      setEditingInquiry(null);
      form.reset();
    },
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("DELETE", `/api/admin/inquiries/${id}`, undefined, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Inquiry deleted" });
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    updateInquiryMutation.mutate(data);
  };

  const filtered = inquiries.filter(
    (i) => filterType === "all" || i.inquiryType === filterType
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    reviewed: "bg-yellow-100 text-yellow-800",
    responded: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Inquiry</DialogTitle>
            <DialogDescription>
              Update the inquiry details and status below
            </DialogDescription>
          </DialogHeader>
          {editingInquiry && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} data-testid="input-inquiry-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-inquiry-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateInquiryMutation.isPending} className="w-full" data-testid="button-save-inquiry">
                  {updateInquiryMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Inquiry"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Inquiries</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40" data-testid="select-inquiry-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="project_discussion">Project Discussion</SelectItem>
              <SelectItem value="custom_solution">Custom Solution</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as "newest" | "oldest")}>
            <SelectTrigger className="w-40" data-testid="select-sort-order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {sorted.length} of {inquiries.length} inquiries
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((inquiry) => (
            <Card key={inquiry.id} className="hover-elevate" data-testid={`inquiry-card-${inquiry.id}`}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  <div>
                    <h3 className="font-bold">{inquiry.name}</h3>
                    <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                    {inquiry.phone && (
                      <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">MESSAGE</p>
                    <p className="text-sm line-clamp-2">{inquiry.message}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">TYPE</p>
                    <p className="text-sm">{inquiry.inquiryType?.replace("_", " ").toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingInquiry(inquiry);
                        form.reset(inquiry);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-inquiry-${inquiry.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInquiryMutation.mutate(inquiry.id)}
                      data-testid={`button-delete-inquiry-${inquiry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No inquiries found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
