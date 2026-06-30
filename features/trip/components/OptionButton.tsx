import { cn } from '@/lib/utils';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}

export default function OptionButton({ label, selected, onClick, description }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
        'hover:shadow-sm',
        selected
          ? 'border-blue-600 bg-blue-600 shadow-md shadow-blue-100'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
            selected
              ? 'border-white bg-white'
              : 'border-gray-300 bg-white group-hover:border-blue-400'
          )}
        >
          {selected && (
            <span className="size-2.5 rounded-full bg-blue-600" />
          )}
        </span>
        <div className="min-w-0">
          <span
            className={cn(
              'block text-sm font-medium leading-snug transition-colors duration-200',
              selected ? 'text-white' : 'text-gray-800'
            )}
          >
            {label}
          </span>
          {description && (
            <span
              className={cn(
                'mt-0.5 block text-xs transition-colors duration-200',
                selected ? 'text-blue-100' : 'text-gray-400'
              )}
            >
              {description}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
