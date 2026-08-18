import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VehicleAttentionItem } from '../types';
import { VehicleIcon } from './VehicleIcon';

export const AttentionItemRow = ({ item }: { item: VehicleAttentionItem }) => (
  <Link className="cb-attention-row" to={`/vehicle/component/${item.componentId}`}>
    <span className="cb-round-icon cb-round-icon--attention"><VehicleIcon name={item.icon} /></span>
    <span>
      <strong>{item.title}</strong>
      <small>{item.description}</small>
    </span>
    <ChevronRight size={20} aria-hidden="true" />
  </Link>
);
