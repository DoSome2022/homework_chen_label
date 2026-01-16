// src/components/admin/EditEmployeeDialog.tsx
'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateEmployee } from "@/lib/actions/admin-employee";
import { employeeSchema } from "@/lib/schemas/employee"; // ← 正確匯入
import { Edit } from "lucide-react";

type Employee = { id: string; name: string | null; email: string | null };



type EditFormValues = z.infer<typeof employeeSchema>;

export function EditEmployeeDialog({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee.name ?? "",
      email: employee.email ?? "",
      password: "",
    },
  });

  const onSubmit = async (data: EditFormValues) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);

    try {
      await updateEmployee(employee.id, formData);
      setOpen(false);
      // toast.success("員工資料更新成功") // 建議加入 toast
    } catch (error) {
      console.error("更新失敗:", error);
      // toast.error("更新失敗，請稍後再試")
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>編輯員工</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名稱</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密碼（留空則不變更）</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="輸入新密碼以變更"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">儲存變更</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}