"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const jobApplicationSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    phone: z.string().min(10, { message: "Phone number too short." }),
    resume: z.any().optional(), // For demo, we are not fully validating file
    coverLetter: z.string().optional(),
});

export function JobApplicationDialog({ job, trigger }) {
    const form = useForm({
        resolver: zodResolver(jobApplicationSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            coverLetter: "",
        },
    });

    const onSubmit = (data) => {
        // Mock API call
        console.log("Submitting application for:", job?.title, data);

        // Simulate network request
        setTimeout(() => {
            toast.success(`Application submitted for ${job?.title || "a position"}!`, {
                description: "We'll be in touch soon.",
            });
            form.reset();
        }, 1000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button>Apply Now</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apply for {job?.title || "Position"}</DialogTitle>
                    <DialogDescription>
                        Send us your details and resume. We'll get back to you shortly.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" />
                        {form.formState.errors.fullName && (
                            <p className="text-destructive text-xs">{form.formState.errors.fullName.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" />
                            {form.formState.errors.email && (
                                <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" {...form.register("phone")} placeholder="+1 (555) 000-0000" />
                            {form.formState.errors.phone && (
                                <p className="text-destructive text-xs">{form.formState.errors.phone.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="resume">Resume (PDF)</Label>
                        <Input id="resume" type="file" accept=".pdf,.doc,.docx" {...form.register("resume")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea id="coverLetter" {...form.register("coverLetter")} placeholder="Tell us why you're a good fit..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
