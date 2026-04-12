
interface FloatingCardProps {
    className: string;
    icon: string;
    title: string;
    subtitle: string;
}


export function FloatingCard({ className, icon, title, subtitle }: FloatingCardProps){
    return (
        <div className={`absolute z-20 backdrop-blur-md bg-surface/80 border border-surface-overlay shadow-xl rounded-2xl p-4 flex items-center gap-4 animate-appearance-in ${className}`}>
            <div className="text-2xl bg-primary-subtle p-2 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-text-primary font-bold text-sm">{title}</span>
                <span className="text-text-muted text-xs font-medium">{subtitle}</span>
            </div>
        </div>
    );
};