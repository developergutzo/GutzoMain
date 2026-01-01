import React from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const WhatsAppIcon: React.FC = () => (
  <MessageCircle size={18} strokeWidth={1.6} color="var(--gutzo-selected)" />
);

type ContactCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
};

export const ContactCard: React.FC<ContactCardProps> = ({ icon, label, value, href }) => {
  const content = href ? (
    <a
      href={href}
      className="font-semibold text-sm"
      style={{ color: 'var(--color-primary, var(--primary))' }}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
    >
      {value}
    </a>
  ) : (
    <span className="font-semibold text-sm" style={{ color: 'var(--color-primary, var(--primary))' }}>{value}</span>
  );

  return (
    <div className="w-full bg-[var(--color-card)] rounded-[var(--radius)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-h-[64px] shadow-sm">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div style={{ display: 'inline-flex' }} aria-hidden>
          {icon}
        </div>
  <div className="text-sm font-medium" style={{ color: 'var(--color-muted, #6b7280)' }}>{label}</div>
      </div>

      <div className="ml-auto text-right">
        {content}
      </div>
    </div>
  );
};

export const PhoneIcon: React.FC = () => (
  <Phone size={18} strokeWidth={1.6} color="var(--gutzo-selected)" />
);

export const MailIcon: React.FC = () => (
  <Mail size={18} strokeWidth={1.6} color="var(--gutzo-selected)" />
);

export const MapPinIcon: React.FC = () => (
  <MapPin size={18} strokeWidth={1.6} color="var(--gutzo-selected)" />
);

export default ContactCard;
