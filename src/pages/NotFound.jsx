import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center max-w-md">
        <div className="font-display tabular-nums text-[96px] leading-none tracking-tighter text-gradient">404</div>
        <h1 className="mt-2 text-[20px] font-semibold tracking-tight text-ink-100">That page doesn't exist.</h1>
        <p className="mt-2 text-[13px] text-ink-300 leading-relaxed">
          The URL might be a typo, or this page was removed. Head back to the dashboard or jump straight into a session.
        </p>
        <div className="mt-6 inline-flex items-center gap-2">
          <Link to="/dashboard"><Button variant="glass" size="md">Dashboard</Button></Link>
          <Link to="/practice"><Button variant="brand" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Start a session</Button></Link>
        </div>
      </div>
    </div>
  );
}
