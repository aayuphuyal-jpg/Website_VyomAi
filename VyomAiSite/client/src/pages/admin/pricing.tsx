import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type PricingPackage } from "@shared/schema";
import { insertPricingPackageSchema } from "@shared/schema";
import { z } from "zod";
import { DollarSign } from "lucide-react";

const pricingFormSchema = insertPricingPackageSchema.extend({
  name: z.string().min(2, "Name required"),
  monthlyPrice: z.coerce.number().optional(),
});

type PricingFormData = z.infer<typeof pricingFormSchema>;

export function PricingPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PricingPackage | null>(null);

  const { data: pricingPackages = [] } = useQuery<PricingPackage[]>({
    queryKey: ["/api/pricing"],
  });

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      features: [],
      baseCurrency: "USD",
      highlighted: false,
    },
  });

  const createPricingMutation = useMutation({
    mutationFn: async (data: PricingFormData) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("POST", "/api/admin/pricing", data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing"] });
      toast({ title: "Pricing package created" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: PricingFormData) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("PUT", `/api/admin/pricing/${editingPricing?.id}`, data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing"] });
      toast({ title: "Pricing package updated" });
      setIsDialogOpen(false);
      setEditingPricing(null);
      form.reset();
    },
  });

  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("DELETE", `/api/admin/pricing/${id}`, undefined, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing"] });
      toast({ title: "Pricing package deleted" });
    },
  });

  const onSubmit = (data: PricingFormData) => {
    if (editingPricing) {
      updatePricingMutation.mutate(data);
    } else {
      createPricingMutation.mutate(data);
    }
  };

  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", INR: "₹", NPR: "₨" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pricing Plans</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPricing(null); form.reset(); }} data-testid="button-add-pricing">
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPricing ? "Edit Pricing Plan" : "Create Pricing Plan"}</DialogTitle>
              <DialogDescription>
                {editingPricing ? "Update the pricing details below" : "Fill in the pricing plan details"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Starter" {...field} data-testid="input-pricing-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="999" {...field} data-testid="input-pricing-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Plan description" {...field} data-testid="textarea-pricing-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createPricingMutation.isPending || updatePricingMutation.isPending} className="w-full" data-testid="button-save-pricing">
                  {createPricingMutation.isPending || updatePricingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPricing ? "Update" : "Create"} Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {pricingPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricingPackages.map((pkg) => {
            const symbol = currencySymbols[pkg.baseCurrency || "USD"] || "$";
            return (
              <Card
                key={pkg.id}
                className={`hover-elevate flex flex-col ${pkg.highlighted ? "ring-2 ring-primary" : ""}`}
                data-testid={`pricing-card-${pkg.id}`}
              >
                {pkg.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-semibold rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardContent className="flex-1 pt-6">
                  <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold mb-2">
                    {symbol}{pkg.price.toLocaleString()}
                  </p>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                  )}
                  
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {pkg.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {pkg.features.length > 5 && (
                        <li className="text-sm text-muted-foreground">
                          +{pkg.features.length - 5} more features
                        </li>
                      )}
                    </ul>
                  )}
                </CardContent>

                <div className="p-4 flex gap-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPricing(pkg);
                      form.reset(pkg);
                      setIsDialogOpen(true);
                    }}
                    data-testid={`button-edit-pricing-${pkg.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePricingMutation.mutate(pkg.id)}
                    data-testid={`button-delete-pricing-${pkg.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
            <DollarSign className="w-12 h-12 opacity-50" />
            <p>No pricing plans yet. Create your first plan!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
