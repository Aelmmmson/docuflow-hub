import { Mail, Calendar, FileText, Star, Zap, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Template {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  mostUsed: boolean;
  documentType: string;
  defaultDescription: string;
}

const templates: Template[] = [
  { 
    id: "expense",
    name: "Expense Report", 
    icon: Receipt, 
    mostUsed: true,
    documentType: "expense",
    defaultDescription: "Expense report submission",
  },
  { 
    id: "invoice",
    name: "Invoice Request", 
    icon: FileText, 
    mostUsed: false,
    documentType: "invoice",
    defaultDescription: "Vendor invoice for payment processing",
  },
  { 
    id: "contract",
    name: "Contract Document", 
    icon: Calendar, 
    mostUsed: false,
    documentType: "contract",
    defaultDescription: "Contract document for approval",
  },
];

interface QuickTemplatesProps {
  onSelectTemplate?: (template: Template) => void;
}

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  const handleTemplateClick = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md border border-border">
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Quick Templates</h3>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-2.5 transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98]",
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
