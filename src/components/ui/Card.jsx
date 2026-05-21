import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

/**
 * The default card surface — glassmorphic dark with a hairline border.
 * Compose with explicit padding so dashboards can vary density.
 */
const Card = forwardRef(function Card(
  { className, as: Component = 'div', glow = false, ...rest },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cn(
        'glass rounded-2xl',
        glow && 'relative before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none before:bg-gradient-to-br before:from-brand-500/10 before:to-cyan-500/5 before:opacity-60',
        className,
      )}
      {...rest}
    />
  );
});

export default Card;

export function CardHeader({ className, ...rest }) {
  return <div className={cn('px-6 pt-5 pb-3', className)} {...rest} />;
}

export function CardBody({ className, ...rest }) {
  return <div className={cn('px-6 pb-6', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }) {
  return <div className={cn('px-6 py-4 hairline', className)} {...rest} />;
}
