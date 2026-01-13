'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { type HTMLMotionProps, type Transition, motion } from 'motion/react';

import { cn } from '@/core/lib/utils';
import {
  MotionHighlight,
  MotionHighlightItem,
} from '@/core/components/animate-ui/effects/motion-highlight';
import { haptics } from '@/core/lib/haptics';

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  enableSwipe?: boolean;
};

function Tabs({ className, enableSwipe = false, value, onValueChange, ...props }: TabsProps) {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipe || !touchStartRef.current || !value || !onValueChange) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      haptics.light();

      // Find all tab triggers to determine navigation order
      const tabsList = e.currentTarget.querySelector('[data-slot="tabs-list"]');
      if (!tabsList) return;

      const triggers = Array.from(tabsList.querySelectorAll('[data-slot="tabs-trigger"]'));
      const tabValues = triggers.map(trigger => {
        const value = trigger.getAttribute('value');
        const dataValue = trigger.getAttribute('data-value');
        const id = trigger.getAttribute('id');

        // Try to extract value from ID if value attribute is not available
        if (value) return value;
        if (dataValue) return dataValue;
        if (id && id.includes('trigger-')) {
          return id.split('trigger-')[1];
        }
        return null;
      }).filter(Boolean);

      const currentIndex = tabValues.indexOf(value);
      if (currentIndex === -1) return;

      let newIndex;
      if (deltaX > 0) {
        // Swipe right - go to previous tab
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1;
      } else {
        // Swipe left - go to next tab
        newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0;
      }

      const newValue = tabValues[newIndex];
      if (typeof newValue === 'string') {
        onValueChange(newValue);
      }
    }

    touchStartRef.current = null;
  };

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      value={value}
      onValueChange={onValueChange}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  activeClassName?: string;
  transition?: Transition;
};

function TabsList({
  ref,
  children,
  className,
  activeClassName,
  transition = {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
  ...props
}: TabsListProps) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref as any, () => localRef.current as HTMLDivElement);

  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    undefined,
  );

  const getActiveValue = React.useCallback(() => {
    if (!localRef.current) return;
    const activeTab = localRef.current.querySelector<HTMLElement>(
      '[data-state="active"]',
    );
    if (!activeTab) return;
    setActiveValue(activeTab.getAttribute('data-value') ?? undefined);
  }, []);

  React.useEffect(() => {
    getActiveValue();

    const observer = new MutationObserver(getActiveValue);

    if (localRef.current) {
      observer.observe(localRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [getActiveValue]);

  return (
    <MotionHighlight
      controlledItems
      className={cn('rounded-sm bg-background shadow-sm', activeClassName)}
      value={activeValue}
      transition={transition}
    >
      <TabsPrimitive.List
        ref={localRef}
        data-slot="tabs-list"
        className={cn(
          'bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-[4px]',
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </MotionHighlight>
  );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  return (
    <MotionHighlightItem value={value} className="size-full">
      <TabsPrimitive.Trigger
        data-slot="tabs-trigger"
        className={cn(
          'inline-flex cursor-pointer items-center size-full justify-center whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground z-[1]',
          className,
        )}
        value={value}
        {...props}
      />
    </MotionHighlightItem>
  );
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content> &
  HTMLMotionProps<'div'> & {
    transition?: Transition;
  };

function TabsContent({
  className,
  children,
  ...props
}: TabsContentProps) {
  return (
    <TabsPrimitive.Content asChild {...props}>
      <motion.div
        data-slot="tabs-content"
        className={cn('flex-1 outline-none', className)}
        layout
        {...props}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

type TabsContentsProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  className?: string;
  transition?: Transition;
};

function TabsContents({
  children,
  className,
  transition = { type: 'spring', stiffness: 200, damping: 25 },
  ...props
}: TabsContentsProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const newHeight = entries?.[0]?.contentRect.height;
      if (!newHeight) return;
      requestAnimationFrame(() => {
        setHeight(newHeight);
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const initialHeight = containerRef.current.getBoundingClientRect().height;
      setHeight(initialHeight);
    }
  }, [children]);

  return (
    <motion.div
      data-slot="tabs-contents"
      layout
      animate={{ height: height }}
      transition={transition}
      className={className}
      {...props}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
  type TabsContentsProps,
};
