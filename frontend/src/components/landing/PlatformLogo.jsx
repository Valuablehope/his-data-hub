import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';

// Shared logo-with-fallback used anywhere a PlatformLinks entry is rendered
// (footer badges, the homepage "Connected Systems" grid). Falls back to a
// colored initial if no logo has been uploaded yet, or if the image 404s.
const PlatformLogo = ({ link, size = 22, radius = 6 }) => {
  const [errored, setErrored] = useState(false);
  const initial = (link.name || '?').charAt(0).toUpperCase();

  if (link.hasLogo && !errored) {
    return (
      <img
        src={`${API_BASE_URL}/platform-links/${link.id}/logo`}
        alt={link.name}
        onError={() => setErrored(true)}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--teal-500)', color: '#fff', fontWeight: 700, fontSize: size * 0.42,
    }}>
      {initial}
    </span>
  );
};

export default PlatformLogo;
