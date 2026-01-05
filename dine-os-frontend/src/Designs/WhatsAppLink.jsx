import { MdOutlineWhatsapp } from "react-icons/md";

export default function WhatsAppLink({ restaurant }) {
  const whatsapp = restaurant?.socialMediaLinks?.find(
    (item) => item.platform === "whatsapp"
  );

  if (!whatsapp?.link) return null; // don't render if no WhatsApp

  return (
    <a
      href={`${whatsapp.link}`} // assuming you store only number
      target="_blank"
      rel="noopener noreferrer"
    >
      <MdOutlineWhatsapp className="mobile-icon mobile-whatsapp-icon" />
    </a>
  );
}
