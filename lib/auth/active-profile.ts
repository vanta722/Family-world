import { cookies } from 'next/headers';

const ACTIVE_PROFILE_COOKIE = 'flw_active_profile_id';

export async function setActiveProfile(profileId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/'
  });
}

export async function getActiveProfileId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value ?? null;
}
