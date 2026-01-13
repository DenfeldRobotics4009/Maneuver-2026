import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { HelpCircle, X, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { getPageHelp } from "@/core/lib/pageHelpConfig";

interface PageHelpTooltipProps {
  title?: string;
  content?: string | string[];
  useDialog?: boolean; // New prop to control dialog vs tooltip
}

export const PageHelpTooltip = ({ title, content, useDialog = false }: PageHelpTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();
  
  // Use provided content or get from config based on current route
  const pageHelp = getPageHelp(location.pathname);
  const finalTitle = title || pageHelp?.title || "Page Help";
  const finalContent = content || pageHelp?.content || ["No help available for this page."];
  
  const contentArray = Array.isArray(finalContent) ? finalContent : [finalContent];

  // Don't render if no help content is available
  if (!title && !content && !pageHelp) {
    return null;
  }

  // Determine if we should use dialog (for advanced tutorials) or simple tooltip
  const shouldUseDialog = useDialog || pageHelp?.useDialog || contentArray.length > 3 || 
    contentArray.some(item => item.length > 200);

  // Dialog version for advanced tutorials
  if (shouldUseDialog) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-fit px-2 mr-0 "
          >
            <span className="flex items-center justify-center">Page Help</span>
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{finalTitle}</DialogTitle>
              <Badge variant="secondary" className="text-xs">Tutorial</Badge>
            </div>
            <DialogDescription className="sr-only">
              Detailed tutorial for {finalTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {contentArray.map((paragraph, index) => {
              // Check if content contains image/GIF references
              if (paragraph.includes('![') && paragraph.includes('](')) {
                // Parse markdown-style image syntax: ![alt](src)
                const match = paragraph.match(/!\[([^\]]*)\]\(([^)]*)\)/);
                if (match) {
                  const [, alt, src] = match;
                  return (
                    <div key={index} className="text-center my-6">
                      <div className="bg-muted rounded-lg p-6 mb-2">
                        <div className="text-muted-foreground text-sm space-y-2">
                          <div className="w-16 h-16 mx-auto bg-muted-foreground/20 rounded-lg flex items-center justify-center mb-4">
                            {!navigator.onLine ? (
                              <div className="text-center">
                                <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto" title="Offline" />
                              </div>
                            ) : (
                              <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                            )}
                          </div>
                          <p className="font-medium">
                            {!navigator.onLine ? 'Offline Mode' : 'Tutorial Visual'}: {alt}
                          </p>
                          <p className="text-xs">
                            {!navigator.onLine ? 'Available when online' : 'Coming Soon'}: {src}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {!navigator.onLine 
                              ? 'Follow the numbered steps below - visuals will load when back online'
                              : 'This will show an interactive demonstration of the process'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              }
              
              // Check if it's a step (starts with number or bullet)
              const isStep = /^\d+\.|•|-/.test(paragraph.trim());
              
              // Extract the actual step number from the content
              let stepNumber = '';
              if (isStep) {
                const match = paragraph.trim().match(/^(\d+)\./);
                stepNumber = match?.[1] ?? '•';
              }
              
              return (
                <div key={index} className={isStep ? "flex gap-3" : ""}>
                  {isStep && (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5 shrink-0">
                      {stepNumber}
                    </div>
                  )}
                  <p className={`text-sm ${isStep ? 'flex-1' : ''} ${isStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {paragraph.replace(/^\d+\.|•|-\s*/, '')}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Original tooltip version for simple help
  if (isOpen) {
    return (
      <Card className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{finalTitle}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 text-sm">
            {contentArray.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 w-8 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>How to use this page</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
