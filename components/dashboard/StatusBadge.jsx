import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
const statusConfig = {
    completed: { label: "Completed", variant: "default" },
    "in-progress": { label: "In Progress", variant: "secondary" },
    pending: { label: "Pending", variant: "outline" },
    active: { label: "Active", variant: "default" },
    inactive: { label: "Inactive", variant: "outline" },
    paid: { label: "Paid", variant: "default" },
    unpaid: { label: "Unpaid", variant: "destructive" },
    overdue: { label: "Overdue", variant: "destructive" },
};
const StatusBadge = ({ status, className }) => {
    const config = statusConfig[status];
    return (<Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>);
};
export default StatusBadge;
