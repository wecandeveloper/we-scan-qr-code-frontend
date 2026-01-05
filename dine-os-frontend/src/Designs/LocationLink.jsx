import { IoLocationOutline } from "react-icons/io5";

export default function LocationLink({ restaurant }) {
    const coords = restaurant?.location?.coordinates;
    
    if (!coords || coords.length < 2) return null;

    const [lng, lat] = coords; // GeoJSON order: [longitude, latitude]

    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-icon mobile-location-icon"
        >
            <IoLocationOutline />
        </a>
    );
}