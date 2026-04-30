export type SoundName =
  | 'shipAdd'
  | 'buildingAdd'
  | 'bannerAdd'
  | 'brokenAdd'
  | 'portalAdd'
  | 'golemAdd'
  | 'seatAdd'
  | 'blightAdd'
  | 'outrage'
  | 'resources'
  | 'cheer'
  | 'tokenRemove'
  | 'cardMove'
  | 'panelOpen'
  | 'panelClose';

const soundPaths: Record<SoundName, string> = {
  shipAdd: '/assets/sounds/ship-add.mp3',
  buildingAdd: '/assets/sounds/building-add.mp3',
  bannerAdd: '/assets/sounds/banner-add.mp3',
  brokenAdd: '/assets/sounds/broken-add.mp3',
  portalAdd: '/assets/sounds/portal-add.mp3',
  golemAdd: '/assets/sounds/golem-add.mp3',
  seatAdd: '/assets/sounds/seat-add.mp3',
  blightAdd: '/assets/sounds/blight-add.mp3',
  outrage: '/assets/sounds/outrage.mp3',
  resources: '/assets/sounds/resources.mp3',
  cheer: '/assets/sounds/cheer.mp3',
  tokenRemove: '/assets/sounds/token-remove.mp3',
  cardMove: '/assets/sounds/card-move.mp3',
  panelOpen: '/assets/sounds/panel-open.mp3',
  panelClose: '/assets/sounds/panel-close.mp3',
};

const MUSIC_VOLUME_STORAGE_KEY = 'arcs-music-volume';
const SFX_VOLUME_STORAGE_KEY = 'arcs-sfx-volume';
const SFX_MUTED_STORAGE_KEY = 'arcs-sfx-muted';

function clampVolume(value: number) {
  if (Number.isNaN(value)) return 0.35;
  return Math.min(1, Math.max(0, value));
}

function readStoredVolume(key: string, fallback: number) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);

  if (stored === null) {
    return fallback;
  }

  return clampVolume(Number(stored));
}

let musicVolume = readStoredVolume(MUSIC_VOLUME_STORAGE_KEY, 0.45);
let sfxVolume = readStoredVolume(SFX_VOLUME_STORAGE_KEY, 0.35);

if (
  typeof window !== 'undefined' &&
  window.localStorage.getItem(SFX_MUTED_STORAGE_KEY) === 'true' &&
  window.localStorage.getItem(SFX_VOLUME_STORAGE_KEY) === null
) {
  sfxVolume = 0;
}

const sounds = Object.fromEntries(
  Object.entries(soundPaths).map(([name, path]) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    return [name, audio];
  })
) as Record<SoundName, HTMLAudioElement>;

function notifyVolumeChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('arcs-volume-change'));
  }
}

export function getMusicVolume() {
  return musicVolume;
}

export function setMusicVolume(volume: number) {
  musicVolume = clampVolume(volume);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(musicVolume));
  }

  notifyVolumeChange();
}

export function getSfxVolume() {
  return sfxVolume;
}

export function setSfxVolume(volume: number) {
  sfxVolume = clampVolume(volume);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_VOLUME_STORAGE_KEY, String(sfxVolume));
    window.localStorage.setItem(SFX_MUTED_STORAGE_KEY, String(sfxVolume === 0));
  }

  notifyVolumeChange();
}

export function getSoundEffectsMuted() {
  return sfxVolume <= 0;
}

export function setSoundEffectsMuted(isMuted: boolean) {
  setSfxVolume(isMuted ? 0 : 0.35);
}

export function playSound(name: SoundName) {
  if (sfxVolume <= 0) {
    return;
  }

  const sound = sounds[name];

  if (!sound) return;

  sound.currentTime = 0;
  sound.volume = sfxVolume;
  sound.play().catch(() => {});
}