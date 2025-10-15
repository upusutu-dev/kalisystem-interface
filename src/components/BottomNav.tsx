import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/items', icon: Package, label: 'Items' },
  { path: '/order', icon: ShoppingCart, label: 'Order' },
  { path: '/bulk', icon: FileText, label: 'Dispatch' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 border border-border/50 backdrop-blur-xl z-50 shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-2xl px-4 py-2">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center flex-4 h-full gap-2 transition-all duration-300 rounded-lg mx-2 relative',
                isActive
                  ? 'text-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-2 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-all duration-300',
                isActive && 'scale-130 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
              )} />
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 to-transparent opacity-50 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
