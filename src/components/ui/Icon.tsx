import { Icon as IconifyIcon, IconProps as IconifyProps } from '@iconify/react';
import { cn } from '@/utils/cn';

interface IconProps extends Omit<IconifyProps, 'icon'> {
  // We force 'icon' to be a string, or you could restrict it to specific keys later
  icon: string;
  className?: string;
  size?: number | string;
}

export default function Icon({ icon, className, size = 20, ...props }: IconProps) {
  return (
    <IconifyIcon
      icon={icon}
      width={size}
      height={size}
      className={cn("align-middle text-current", className)}
      {...props}
    />
  );
}