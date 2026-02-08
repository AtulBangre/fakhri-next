"use client";
import { useState } from "react";
import { HelpCircle, MessageSquarePlus, ChevronDown, ChevronUp, Send, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { faqData, feedbackCategories } from "@/data/faqData";

const SupportTab = () => {
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        category: "general",
        subject: "",
        message: "",
        rating: 0
    });

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the feedback to your backend
        console.log("Feedback submitted:", formData);
        setFeedbackSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
            setFeedbackSubmitted(false);
            setShowFeedbackForm(false);
            setFormData({
                category: "general",
                subject: "",
                message: "",
                rating: 0
            });
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Feedback & Support</h1>
                <p className="text-muted-foreground">Find answers to common questions or share your feedback with us.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* FAQ Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-heading font-semibold">Frequently Asked Questions</h2>
                            <p className="text-sm text-muted-foreground">Quick answers to common queries</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border overflow-hidden">
                        {faqData.map((faq, index) => (
                            <div
                                key={faq.id}
                                className={`${index !== faqData.length - 1 ? 'border-b' : ''}`}
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
                                >
                                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                                    {expandedFaq === faq.id ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                </button>
                                {expandedFaq === faq.id && (
                                    <div className="px-4 pb-4 text-sm text-muted-foreground animate-in slide-in-from-top-1 duration-200">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <MessageSquarePlus className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="font-heading font-semibold">Share Your Feedback</h2>
                            <p className="text-sm text-muted-foreground">Help us improve your experience</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6">
                        {!showFeedbackForm && !feedbackSubmitted ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <MessageSquarePlus className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg mb-2">We Value Your Feedback</h3>
                                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                                    Your feedback helps us improve our services and provide you with a better experience.
                                </p>
                                <Button onClick={() => setShowFeedbackForm(true)} className="gap-2">
                                    <MessageSquarePlus className="h-4 w-4" />
                                    Give Feedback
                                </Button>
                            </div>
                        ) : feedbackSubmitted ? (
                            <div className="text-center py-8 animate-in fade-in duration-300">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="font-medium text-lg mb-2">Thank You!</h3>
                                <p className="text-muted-foreground text-sm">
                                    Your feedback has been submitted successfully.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">Feedback Form</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowFeedbackForm(false)}
                                        className="p-1 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Rating */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">How would you rate your experience?</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingClick(star)}
                                                className={`w-10 h-10 rounded-lg border-2 transition-all ${formData.rating >= star
                                                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-600'
                                                        : 'border-border hover:border-yellow-400/50'
                                                    }`}
                                            >
                                                {star}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        {feedbackCategories.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Brief summary of your feedback"
                                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Please share your detailed feedback..."
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button type="submit" className="w-full gap-2">
                                    <Send className="h-4 w-4" />
                                    Submit Feedback
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Additional Help */}
                    <div className="bg-accent/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Need immediate assistance? Contact your account manager or email us at{" "}
                            <a href="mailto:support@fakhriit.com" className="text-primary hover:underline font-medium">
                                support@fakhriit.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTab;
