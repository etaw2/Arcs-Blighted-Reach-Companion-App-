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

const SFX_MUTED_STORAGE_KEY = 'arcs-sfx-muted';

let soundEffectsMuted =
  typeof window !== 'undefined'
    ? window.localStorage.getItem(SFX_MUTED_STORAGE_KEY) === 'true'
    : false;

const sounds = Object.fromEntries(
  Object.entries(soundPaths).map(([name, path]) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    return [name, audio];
  })
) as Record<SoundName, HTMLAudioElement>;

export function getSoundEffectsMuted() {
  return soundEffectsMuted;
}

export function setSoundEffectsMuted(isMuted: boolean) {
  soundEffectsMuted = isMuted;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_MUTED_STORAGE_KEY, String(isMuted));
  }
}

export function playSound(name: SoundName) {
  if (soundEffectsMuted) {
    return;
  }

  const sound = sounds[name];

  if (!sound) return;

  sound.currentTime = 0;
  sound.volume = 0.35;
  sound.play().catch(() => {});
}