import React, { useState } from "react";
import AddressSearch from "./AddressSearch";
import { Spin, Image } from "antd";
import {
  getPlacePhotoUrl,
  ensurePlacePhotoCached,
  fetchPhotos,
} from "../../api/maps";

interface AddressImageProps {
  onSelect?: (address: string, placeId?: string, photoUrl?: string) => void;
}

const AddressImage: React.FC<AddressImageProps> = ({ onSelect }) => {
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (address: string, placeId?: string) => {
    setAddress(address);
    setPlaceId(placeId);
    setPhotoUrl(null);
    if (onSelect) onSelect(address, placeId);

    if (!placeId) return;

    setLoading(true);
    try {
      // fetchPhotos returns [{ photo_reference: string }]
      const photos = await fetchPhotos(placeId);
      setLoading(false);
      if (photos && photos.length > 0) {
        const photoReference = photos[0].photo_reference; // this is the photo resource name
        // Pass both photoReference and placeId to the backend
        const backendUrl = getPlacePhotoUrl(photoReference, placeId);
        try {
          await ensurePlacePhotoCached(photoReference, placeId);
        } catch (e) {
          // Optionally handle fetch error
        }
        setPhotoUrl(backendUrl);
        if (onSelect) onSelect(address, placeId, backendUrl);
      } else {
        setPhotoUrl(null);
        if (onSelect) onSelect(address, placeId, undefined);
      }
    } catch (e) {
      setLoading(false);
      setPhotoUrl(null);
      if (onSelect) onSelect(address, placeId, undefined);
    }
  };

  return (
    <div>
      <AddressSearch onSelect={handleSelect} />
      {loading && <Spin />}
      {photoUrl && (
        <div style={{ marginTop: 16 }}>
          <Image
            src={photoUrl}
            alt={address}
            width={400}
            height={300}
            style={{ width: "100%", maxWidth: 400, borderRadius: 8 }}
          />
        </div>
      )}
      {!loading && !photoUrl && placeId && (
        <div style={{ marginTop: 16, color: "#888" }}>
          No image found for this address.
        </div>
      )}
    </div>
  );
};

export default AddressImage;
