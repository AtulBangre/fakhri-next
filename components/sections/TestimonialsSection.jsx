"use client";
import { Star, Quote } from "lucide-react";
const testimonials = [
    {
        name: "Sarah Johnson",
        role: "CEO, TechGadgets Co",
        content: "Fakhri IT Services transformed our Amazon business. Our sales increased by 300% in just 6 months. Their team is incredibly responsive and professional.",
        rating: 5,
    },
    {
        name: "Michael Chen",
        role: "Founder, HomeEssentials",
        content: "The PPC management alone has saved us thousands of dollars while improving our ACOS. Best investment we've made for our e-commerce business.",
        rating: 5,
    },
    {
        name: "Emily Rodriguez",
        role: "Director, BeautyBrand Inc",
        content: "Their A+ Content design is exceptional. Our product pages now convert at 2x the industry average. Highly recommended!",
        rating: 5,
    },
];
const TestimonialsSection = () => {
    return (<section className="py-20 lg:py-32 bg-accent/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-6">
            Trusted by 500+ Amazon Sellers
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our clients have to say about their experience working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (<div key={testimonial.name} className="relative p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10"/>
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-primary text-primary"/>))}
              </div>

              <p className="text-muted-foreground mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
};
export default TestimonialsSection;
