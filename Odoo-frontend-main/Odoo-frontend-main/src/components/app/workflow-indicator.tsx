'use client';

import * as React from 'react';
import { cn } from "@/lib/utils";

type WorkflowIndicatorProps = {
  statuses: string[];
  currentStatus: string;
};

export default function WorkflowIndicator({ statuses, currentStatus }: WorkflowIndicatorProps) {
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full">
      {statuses.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : "",
                  isCurrent ? "border-primary" : "",
                  isFuture ? "border-border text-muted-foreground" : ""
                )}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  <span className={cn(isCurrent && "w-3 h-3 rounded-full bg-primary")}></span>
                )}
              </div>
              <p className={cn(
                "mt-2 text-xs text-center",
                isCurrent ? "font-bold text-primary" : "text-muted-foreground"
              )}>
                {status}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2",
                index < currentIndex ? "bg-primary" : "bg-border"
              )}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
