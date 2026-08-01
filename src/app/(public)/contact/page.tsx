"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Headphones
} from "lucide-react";

const FAQS = [
  {
    question: "Are the products sold on SKYDGETS genuine and authentic?",
    answer: "Yes, 100%. Every product on SKYDGETS is sourced directly from manufacturers or trusted global suppliers abroad. We do not sell grey-market or counterfeit items. Our AI-assisted listing pipeline also verifies product details against photos to ensure specs are accurate."
  },
  {
    question: "What does pre-shipment quality check mean?",
    answer: "Before any unit is listed and shipped, it goes through a quality inspection to confirm hardware functionality, check for any visible damage, and verify that the product matches the described specifications. Items that don't pass the check are not listed."
  },
  {
    question: "How fast is delivery?",
    answer: "Orders placed before 2:00 PM are typically processed the same day. Local express delivery in Dhaka usually arrives within 24 hours. Nationwide delivery takes 1–3 business days depending on your location."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept Cash on Delivery (COD) across Bangladesh. Digital payment options including bKash and Nagad are being rolled out soon. All pricing is in Bangladeshi Taka (BDT) with no hidden charges."
  }
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Question");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      
      {/* HERO SECTION */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 md:pb-24 overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/80 via-white to-white">
        {/* Background Grid Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.08),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-violet-600 border border-violet-500/20 shadow-sm mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WE'RE HERE TO HELP</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-[1.1]">
            Contact Support & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500">
              Get Instant Assistance
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-2xl font-normal leading-relaxed">
            Have questions about a product, import origin, delivery timeline, or payment options? Send us a message and our support team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* SUPPORT CHANNELS & FORM */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
                Support Channels
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Connect with our customer service team via email, phone, or live chat.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Email Us</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">For order & general inquiries</p>
                  <a href="mailto:support@skydgets.com" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline mt-1.5 inline-block">
                    support@skydgets.com
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Call Support</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Mon – Sat, 9:00 AM – 8:00 PM</p>
                  <a href="tel:+8801700000000" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1.5 inline-block">
                    +880 1700-000000
                  </a>
                </div>
              </div>

              {/* Office Location */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Tech Hub HQ</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Gulshan 2, Dhaka, Bangladesh</p>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 block">
                    Inspection & Fulfillment Center
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Response Notice */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-center gap-3">
              <Headphones className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                Average response time is under <span className="font-bold text-zinc-900 dark:text-white">2 hours</span> during business hours.
              </p>
            </div>
          </div>

          {/* Right Side: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-black/5">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-6">
                Send Us a Message
              </h2>

              {submitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-in fade-in duration-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Thank you! Your message has been sent successfully. We'll be in touch shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Inquiry Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Order & Shipping">Order Status & Shipping</option>
                    <option value="AI Hardware Verification">AI Hardware Verification</option>
                    <option value="Selling a Gadget">Selling a Gadget</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
              Got Questions?
            </h2>
            <h3 className="text-3xl font-black text-zinc-950 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-zinc-950 dark:text-white cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
