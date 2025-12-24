import React from "react";
import { Header } from "../components/Header";
import ContactCard, { PhoneIcon, MailIcon, MapPinIcon, WhatsAppIcon } from "../components/ContactCard";

export function ContactPage() {
  return (
    <div style={{ background: 'var(--bg, #fff)' }} className="flex flex-col">
      <Header />

      <div className="flex items-start justify-center px-4 pt-0">
  <div className="w-full max-w-md mx-auto lg:-mt-16">
          {/* Hero */}
            <section style={{ borderRadius: 12 }} className="mb-6 p-3 flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins' }}>Get in Touch</h1>
              <p className="text-gray-600 text-lg max-w-md">We’re here to help with anything related to Gutzo.</p>
          </section>

          {/* Card */}
            <div className="flex flex-col gap-5 max-w-md mx-auto">
            <ContactCard icon={<PhoneIcon />} label="Phone" value="+91 8903589068" href="tel:+918903589068" />
            <ContactCard icon={<MailIcon />} label="Email" value="manage.gutzo@gmail.com" href="mailto:manage.gutzo@gmail.com" />
            <ContactCard icon={<MapPinIcon />} label="Location" value="Coimbatore, Tamil Nadu, India" />
            <ContactCard icon={<WhatsAppIcon />} label="WhatsApp" value="+91 8903589068" href="https://wa.me/918903589068" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
