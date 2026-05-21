import { cn } from '@/lib/utils.js';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden="true" />;
}
