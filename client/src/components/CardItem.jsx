import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function CardContent({ card }) {
  return (
    <>
      <div className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
        {card.title}
      </div>
      {card.description && (
        <p className="text-xs text-gray-500 mt-1.5 truncate">
          {card.description}
        </p>
      )}
    </>
  );
}

export function StaticCardItem({ card }) {
  return (
    <div className="group bg-white p-3 rounded-lg shadow-md border border-blue-300 cursor-grabbing transition-all duration-200 ease-in-out relative rotate-1">
      <CardContent card={card} />
    </div>
  );
}

export default function CardItem({ card, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid="card-item"
      onClick={onClick}
      className="group bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative"
    >
      <CardContent card={card} />
    </div>
  );
}
