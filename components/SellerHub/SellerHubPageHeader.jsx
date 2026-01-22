import { Button } from "@/components/ui/button";

const SellerHubPageHeader = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="self-start md:self-center">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default SellerHubPageHeader;
