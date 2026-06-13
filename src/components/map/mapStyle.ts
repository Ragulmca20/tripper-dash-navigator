/**
 * Dark map style optimised for motorcycle riders:
 *  - High contrast roads (warm white) on near-black background
 *  - Amber highways matching Royal Enfield Tripper accent
 *  - POIs / transit / labels suppressed to reduce cognitive load
 */
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0A0A0B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8E8E93' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A0B' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1C1C1E' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#2C2C2E' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#FFB400' }, { weight: 1.2 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3A2A00' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#06202A' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#11140F' }],
  },
];
