import { motion } from "framer-motion";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PublicLayout from "@/components/layout/PublicLayout";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Sent");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <PublicLayout>
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="text-4xl font-semibold tracking-tight">Contact Us</h1>
            <p className="mt-4 text-muted-foreground">Have a question? Our team is here to help.</p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6 lg:col-span-2"
            >
              <div className="glass-card p-6">
                <Mail className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-3 font-semibold text-sm">Support</h3>
                <p className="mt-1 text-sm text-muted-foreground">Please contact customer support service for assistance.</p>
              </div>
              <div className="glass-card p-6">
                <MessageSquare className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-3 font-semibold text-sm">Live Chat</h3>
                <p className="mt-1 text-sm text-muted-foreground">Available 24/7 for active investors.</p>
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card flex flex-col gap-4 p-8 lg:col-span-3"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Full name" required className="bg-background" />
                <Input placeholder="Email" type="email" required className="bg-background" />
              </div>
              <Input placeholder="Subject" required className="bg-background" />
              <Textarea placeholder="Your message..." required rows={5} className="bg-background resize-none" />
              <Button type="submit" className="btn-press self-end" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
