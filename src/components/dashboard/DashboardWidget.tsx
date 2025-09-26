import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  value?: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  description,
  icon: Icon,
  value,
  change,
  badge,
  action,
  children,
  isLoading = false,
  className,
  size = 'md'
}) => {
  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className={cn(
            "mb-2",
            size === 'sm' ? "h-6 w-12" : size === 'lg' ? "h-10 w-20" : "h-8 w-16"
          )} />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className={cn(
            "font-medium",
            size === 'sm' ? "text-sm" : size === 'lg' ? "text-base" : "text-sm"
          )}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs">
              {badge.text}
            </Badge>
          )}
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        {value !== undefined && (
          <div className={cn(
            "font-bold",
            size === 'sm' ? "text-lg" : size === 'lg' ? "text-3xl" : "text-2xl"
          )}>
            {value}
          </div>
        )}
        
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
              "flex items-center",
              change.trend === 'up' ? "text-green-600" :
              change.trend === 'down' ? "text-red-600" : "text-gray-600"
            )}>
              {change.value}
            </span>
          </p>
        )}

        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}

        {action && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={action.onClick}
              className="w-full"
            >
              {action.label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;