import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const events = [
  {
    title: "Q1 Portfolio Review",
    date: "Mar 31, 2026",
    description: "Quarterly review of all active investment portfolios and performance metrics.",
    status: "Upcoming",
  },
  {
    title: "New Plan Launch",
    date: "Apr 15, 2026",
    description: "Introduction of new Platinum tier investment plan with enhanced returns.",
    status: "Upcoming",
  },
];

const Event = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming platform events and announcements.</p>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{event.title}</h3>
                <span className="text-xs text-primary">{event.date}</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Event;
