import { Mail, Calendar, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  { name: "Email Template", icon: Mail, mostUsed: true },
  { name: "Event Planner", icon: Calendar, mostUsed: false },
  { name: "Blog Post", icon: FileText, mostUsed: false },
];

export function QuickTemplates() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md">
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Quick Templates</h3>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.name}
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted",
              template.mostUsed && "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <template.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-card-foreground">{template.name}</p>
                <p className="text-2xs text-muted-foreground">Ready to use</p>
              </div>
            </div>
            {template.mostUsed && (
              <div className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5">
                <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                <span className="text-2xs font-medium text-warning">Most used</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
