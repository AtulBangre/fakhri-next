"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "sonner";

export default function FAQManager() {
    const [homeFaqData, setHomeFaqData] = useState([]);
    const [pricingFaqData, setPricingFaqData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/website/faq');
            if (res.ok) {
                const data = await res.json();
                setHomeFaqData(data.filter(f => !f.category || f.category === 'General' || f.category === 'home'));
                setPricingFaqData(data.filter(f => f.category === 'Pricing' || f.category === 'pricing'));
            }
        } catch (error) {
            toast.error("Failed to load FAQs");
        } finally {
            setIsLoading(false);
        }
    };

    const [newFaq, setNewFaq] = useState({ question: "", answer: "", type: "home" });

    const handleFaqChange = (list, setList, index, field, value) => {
        const updatedList = [...list];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setList(updatedList);
    };

    const removeFaq = (list, setList, index) => {
        const updatedList = list.filter((_, i) => i !== index);
        setList(updatedList);
    };

    const addFaq = () => {
        if (newFaq.question && newFaq.answer) {
            if (newFaq.type === "home") {
                setHomeFaqData([...homeFaqData, { question: newFaq.question, answer: newFaq.answer }]);
            } else {
                setPricingFaqData([...pricingFaqData, { question: newFaq.question, answer: newFaq.answer }]);
            }
            setNewFaq({ question: "", answer: "", type: "home" });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Prepare data with correct categories
            const home = homeFaqData.map((f, i) => ({ ...f, category: 'General', sortOrder: i }));
            const pricing = pricingFaqData.map((f, i) => ({ ...f, category: 'Pricing', sortOrder: i }));
            const allFaqs = [...home, ...pricing];

            const res = await fetch('/api/website/faq', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allFaqs)
            });

            if (!res.ok) throw new Error('Failed to update');
            toast.success("FAQs updated!");
            setIsEditing(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save FAQs");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderFaqList = (title, data, setData) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.map((faq, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded relative group">
                        {isEditing && (
                            <button
                                onClick={() => removeFaq(data, setData, index)}
                                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Question</Label>
                            <Input
                                disabled={!isEditing}
                                value={faq.question}
                                onChange={(e) => handleFaqChange(data, setData, index, "question", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Answer</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={faq.answer}
                                onChange={(e) => handleFaqChange(data, setData, index, "answer", e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">FAQ Management</h3>
                <div className="space-x-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Edit FAQs
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {renderFaqList("Home Page FAQs", homeFaqData, setHomeFaqData)}
                {renderFaqList("Pricing Page FAQs", pricingFaqData, setPricingFaqData)}
            </div>

            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New FAQ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4 items-end">
                            <div className="md:col-span-1 space-y-2">
                                <Label>Section</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={newFaq.type}
                                    onChange={(e) => setNewFaq({ ...newFaq, type: e.target.value })}
                                >
                                    <option value="home">Home Page</option>
                                    <option value="pricing">Pricing Page</option>
                                </select>
                            </div>
                            <div className="md:col-span-3 space-y-2">
                                <Label>Question</Label>
                                <Input
                                    value={newFaq.question}
                                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                    placeholder="Enter question..."
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                    value={newFaq.answer}
                                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                    placeholder="Enter answer..."
                                    rows={2}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <Button onClick={addFaq} className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add FAQ
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
