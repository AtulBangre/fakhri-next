
import Link from "next/link";
const Logo = ({ variant = "default", size = "md", showTagline = false }) => {
    const sizeClasses = {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-4xl",
    };
    const colorClass = variant === "white" ? "text-white" : "text-primary";
    return (<Link href="/" className="flex items-center gap-2">
      <span className={`font-heading font-bold ${sizeClasses[size]} ${colorClass} tracking-tight`}>
        Fakhri
      </span>
      {showTagline && (<span className="text-xs text-muted-foreground hidden sm:block">
          IT Services
        </span>)}
    </Link>);
};
export default Logo;
