let activeProfile: string | null = null;
let profiles: string[] = [];

export const uiStore = {
  setProfiles(next: string[]) {
    profiles = [...next];
  },
  getProfiles() {
    return [...profiles];
  },
  setActiveProfile(next: string | null) {
    activeProfile = next;
  },
  getActiveProfile() {
    return activeProfile;
  },
};
