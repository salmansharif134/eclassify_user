import { Button } from "@/components/ui/button";

const SellerHubPageHeader = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col gap-4 border-b-2 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actionLabel && (
        <Button 
          onClick={onAction} 
          className="self-start md:self-center shadow-md hover:shadow-lg transition-shadow"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default SellerHubPageHeader;
