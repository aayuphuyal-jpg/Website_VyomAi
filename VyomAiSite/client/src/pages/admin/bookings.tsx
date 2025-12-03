import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type BookingRequest, insertBookingRequestSchema } from "@shared/schema";
import { Calendar, MapPin, Loader2, Edit, Plus } from "lucide-react";
import { z } from "zod";

const bookingFormSchema = insertBookingRequestSchema.extend({
  name: z.string().min(2, "Name required"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export function BookingsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRequest | null>(null);

  const { data: bookings = [] } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      companyOrPersonal: "",
      message: "",
      status: "created",
      dueDate: "",
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("PUT", `/api/admin/bookings/${editingBooking?.id}`, data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking updated" });
      setIsDialogOpen(false);
      setEditingBooking(null);
      form.reset();
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("DELETE", `/api/admin/bookings/${id}`, undefined, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking deleted" });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    updateBookingMutation.mutate(data);
  };

  const statusColors: Record<string, string> = {
    created: "bg-blue-100 text-blue-800",
    open: "bg-yellow-100 text-yellow-800",
    ongoing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Bookings</h1>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking Status</DialogTitle>
            <DialogDescription>
              Update the booking details and status below
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} data-testid="input-booking-name" />
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
                          <SelectTrigger data-testid="select-booking-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateBookingMutation.isPending} className="w-full" data-testid="button-save-booking">
                  {updateBookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Booking"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Bookings</h1>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover-elevate" data-testid={`booking-card-${booking.id}`}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold">{booking.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
                    <p className="text-sm text-muted-foreground">{booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Project Type</p>
                    <p className="text-sm text-muted-foreground">{booking.projectType}</p>
                    <p className="text-sm text-muted-foreground mt-2">{booking.budget || "Budget not specified"}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs px-2 py-1 rounded w-fit ${statusColors[booking.status] || "bg-gray-100"}`}>
                      {booking.status?.toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBooking(booking);
                          form.reset(booking);
                          setIsDialogOpen(true);
                        }}
                        data-testid={`button-edit-booking-${booking.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBookingMutation.mutate(booking.id)}
                        data-testid={`button-delete-booking-${booking.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 opacity-50 mx-auto mb-2" />
            <p>No bookings yet</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
