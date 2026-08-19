import { Camera, Plus } from 'lucide-react';

interface AttachmentButtonProps {
  label: string;
}

export const AttachmentButton = ({ label }: AttachmentButtonProps) => (
  <button className="cb-attachment-button" type="button" aria-label={`${label}. Upload disponível futuramente.`}>
    <span><Camera size={18} aria-hidden="true" /></span>
    {label}
    <Plus size={18} aria-hidden="true" />
  </button>
);
