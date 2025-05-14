const getIdentityByName = async (username: string): Promise<string | null> => {
  const url = `https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(username)}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const fp = data?.them?.public_keys?.primary?.key_fingerprint;

  if (!fp) return null;

  return fp.slice(-16).toUpperCase();
};

export default getIdentityByName;
