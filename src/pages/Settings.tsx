import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";

const settingsSections = [
  { name: "Profile", description: "Manage your account details", icon: User },
  { name: "Notifications", description: "Configure notification preferences", icon: Bell },
  { name: "Security", description: "Password and authentication settings", icon: Shield },
  { name: "Appearance", description: "Theme and display options", icon: Palette },
];

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-lg font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {settingsSections.map((section, index) => (
          <div
            key={section.name}
            className="group rounded-xl bg-card p-4 shadow-card-md card-hover cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">{section.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Content */}
      <div className="mt-8 rounded-xl bg-card p-8 shadow-card-md max-w-3xl animate-fade-in" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <SettingsIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Settings Coming Soon</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Full settings configuration will be available in a future update. 
            Use the theme toggle in the sidebar to switch between light and dark modes.
          </p>
        </div>
      </div>
    </div>
  );
}
