'use client';

import { motion } from 'framer-motion';

export default function SocialTestimonialCard({ testimonial, index }) {
    return (
        <motion.div
            className="p-6 rounded-xl mx-3 w-80 shrink-0 bg-card border border-border transition-all duration-300 hover:border-primary/50"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex gap-3 mb-4">
                <img
                    className="size-12 rounded-full object-cover ring-2 ring-primary/10"
                    src={testimonial.image}
                    alt={testimonial.name}
                    height={48}
                    width={48}
                />
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="font-poppins font-semibold text-sm">{testimonial.name}</p>
                        {/* Verified Badge */}
                        <svg
                            className="mt-0.5"
                            width="16"
                            height="16"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z"
                                fill="hsl(var(--primary))"
                            />
                        </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">{testimonial.handle}</span>
                </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                "{testimonial.quote}"
            </p>
        </motion.div>
    );
}
