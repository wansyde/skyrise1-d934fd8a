import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Play, CheckCircle2, ListChecks, Clock, DollarSign } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const tasks = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: [
    "Share BMW X7 Campaign", "Review Mercedes-Benz Ad", "Maserati Survey Response",
    "Rolls Royce Content Share", "Audi Campaign Engagement", "Porsche Launch Promo",
    "Bentley Brand Review", "Ferrari Social Post", "Lamborghini Video Ad",
    "Land Rover Survey", "Jaguar Content Share", "Volvo Safety Campaign",
    "Tesla Innovation Post", "Lexus Lifestyle Share", "Genesis Brand Survey",
    "Bugatti Exclusive Promo", "McLaren Speed Campaign", "Aston Martin Heritage",
    "Alfa Romeo Style Post", "Range Rover Adventure", "BMW i Series Review",
    "Mercedes EQ Campaign", "Maserati GranTurismo", "Rolls Royce Ghost Post",
    "Audi e-tron Share", "Porsche Taycan Review", "Bentley Flying Spur",
    "Ferrari Roma Campaign", "Lamborghini Huracán", "Land Rover Defender",
    "Jaguar F-Type Promo", "Volvo XC90 Review", "Tesla Model S Post",
    "Lexus LC Share", "Genesis GV80 Survey", "Bugatti Chiron Feature",
    "McLaren 720S Campaign", "Aston Martin DB12", "Alfa Romeo Tonale",
    "Range Rover Sport Post",
  ][i],
  desc: [
    "Post the campaign on 2 social platforms", "Watch and engage with the video ad",
    "Complete the brand perception survey", "Share content to your network",
    "Like and comment on launch posts", "Promote the new model launch",
    "Submit a detailed brand review", "Share the social media post",
    "Watch and share the video advertisement", "Complete the customer survey",
  ][i % 10],
  reward: [12.50, 8.00, 15.00, 10.00, 6.50, 11.00, 9.50, 14.00, 7.50, 13.00][i % 10],
  status: i < 8 ? "completed" : "pending" as "completed" | "pending",
}));

const Starting = () => {
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const totalEarned = tasks.filter(t => t.status === "completed").reduce((s, t) => s + t.reward, 0);

  return (
    <AppLayout>
      <div className="px-4 py-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <h1 className="text-xl font-semibold tracking-tight">Starting</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete tasks to earn rewards</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="glass-card p-3 text-center">
            <ListChecks className="h-4 w-4 mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <div className="text-lg font-semibold tabular-nums">{totalTasks}</div>
            <span className="text-[10px] text-muted-foreground">Total Tasks</span>
          </motion.div>
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="glass-card p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-success" strokeWidth={1.5} />
            <div className="text-lg font-semibold tabular-nums">{completedTasks}</div>
            <span className="text-[10px] text-muted-foreground">Completed</span>
          </motion.div>
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="glass-card p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-success" strokeWidth={1.5} />
            <div className="text-lg font-semibold tabular-nums">${totalEarned.toFixed(0)}</div>
            <span className="text-[10px] text-muted-foreground">Earned</span>
          </motion.div>
        </div>

        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Daily Progress</h3>
            <span className="text-xs text-muted-foreground tabular-nums">{completedTasks} / {totalTasks} tasks</span>
          </div>
          <div className="progress-track h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="progress-fill h-3"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">{Math.round((completedTasks / totalTasks) * 100)}% complete</span>
            <span className="text-[11px] text-success tabular-nums">+${totalEarned.toFixed(2)} earned</span>
          </div>
        </motion.div>

        {/* Task List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Tasks</h2>
          <span className="text-xs text-primary">{totalTasks - completedTasks} remaining</span>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-muted-foreground tabular-nums">#{task.id}</span>
                    <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    {task.status === "completed" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success flex-shrink-0">Done</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning flex-shrink-0">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{task.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-success tabular-nums">+${task.reward.toFixed(2)}</span>
                  {task.status === "pending" && (
                    <button className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg btn-press transition-all duration-200 hover:brightness-110">
                      <Play className="h-3 w-3" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Starting;
