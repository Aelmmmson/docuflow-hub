import { ReactNode, useEffect, useState } from "react";

interface FolderCardProps {
  count: number;
  label: string;
  title: string;
  color: {
    tab: string;
    body: string;
    layer1: string;
    layer2: string;
  };
  iconColor: string;
  backgroundIcon: ReactNode;
  icon: ReactNode;
  delay?: number;
}

function useCountUp(target: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * target));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

export function FolderCard({ count, label, title, color, iconColor, backgroundIcon, icon, delay = 0 }: FolderCardProps) {
  const animatedCount = useCountUp(count, 1500, delay + 300);

  return (
    <div 
      className="file relative w-full max-w-[240px] h-40 cursor-pointer origin-bottom [perspective:1500px] animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Folder tab */}
      <div className={`work-5 bg-gradient-to-r ${color.tab} w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_10px_20px_rgba(59,130,246,.1)] transition-all ease duration-300 relative 
        after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-gradient-to-r ${color.tab} after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[14px] before:left-[75.5px] before:w-4 before:h-4 before:bg-gradient-to-r ${color.tab} before:[clip-path:polygon(0_35%,0%_100%,50%_100%)]`} />
      
      {/* File layers with subtle colors */}
      <div className={`work-4 absolute inset-1 ${color.layer1} rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-15deg)]`} />
      <div className={`work-2 absolute inset-1 ${color.layer2} rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-28deg)]`} />
      
      {/* Main folder body with gradient and stats */}
      <div className={`work-1 absolute bottom-0 ${color.body} w-full h-[156px] rounded-2xl rounded-tr-none overflow-hidden
        after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[146px] after:h-[16px] after:bg-card after:rounded-t-2xl 
        before:absolute before:content-[''] before:-top-[10px] before:right-[142px] before:size-3 before:bg-card before:[clip-path:polygon(100%_14%,50%_100%,100%_100%)] 
        transition-all ease duration-300 origin-bottom flex items-end 
        group-hover:shadow-[inset_0_15px_30px_rgba(255,255,255,.1),_inset_0_-15px_30px_rgba(30,58,138,.2)] 
        group-hover:[transform:rotateX(-35deg)_translateY(1px)]`}>
        
        {/* Background faint icon positioned to the right */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-10">
          <div className="w-52 h-52 flex items-center justify-center">
            {backgroundIcon}
          </div>
        </div>
        
        {/* Stats on folder cover - Centered with left/right layout */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center justify-between w-4/5">
            {/* Left side: Count and text */}
            <div className="flex flex-col items-start">
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-foreground">{animatedCount}</p>
                <span className="text-lg text-foreground font-medium">{label}</span>
              </div>
              <p className="text-sm text-muted-foreground font-bold tracking-wide mt-1">{title}</p>
            </div>
            
            {/* Right side: Icon */}
            <div className="bg-card/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-primary/30">
              <div className="w-10 h-10" style={{ color: iconColor }}>
                {icon}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
