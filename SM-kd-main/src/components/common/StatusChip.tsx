import { DocumentStatus } from '../../types';
import { Badge } from '../ui/badge';

interface StatusChipProps {
  status: DocumentStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const variants: Record<DocumentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    Draft: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
    Waiting: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300' },
    Ready: { variant: 'default', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    Done: { variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
    Canceled: { variant: 'destructive', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
