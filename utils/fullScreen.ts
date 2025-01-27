interface ScreenDetails {
  currentScreen: ScreenDetailed;
  oncurrentscreenchange: () => void;
  onscreenschange: () => void;
  screens: ScreenDetailed[];
}

interface ScreenDetailed {
  availHeight: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  colorDepth: number;
  devicePixelRatio: number;
  height: number;
  isExtended: boolean;
  isInternal: boolean;
  isPrimary: boolean;
  label: string;
  left: number;
  onchange: () => void;
  orientation: ScreeOrientation;
  pixelDepth: number;
  top: number;
  width: number;
}

interface ScreeOrientation {
  angle: number;
  onchange: () => void;
  type: string;
}

const logging = false;
const log = logging ? console.log : () => {};

export function initFullScreenButton(
  button: string | HTMLButtonElement = 'full-screen',
  target: HTMLElement = document.body,
) {
  const btn = typeof button === 'string' ? (document.getElementById(button) as HTMLButtonElement) : button;
  btn.addEventListener('click', async () => {
    log(`Is extended display: ${(window.screen as any).isExtended}`);
    // Making a request first, then ask for permissions and wait for a response.
    try {
      const details: ScreenDetails = await (window as any).getScreenDetails();
      log(details);
      target.requestFullscreen();
      target.addEventListener('fullscreenchange', () => {
        btn.style.display = document.fullscreenElement ? 'none' : '';
      });
    } catch (e) {
      log(`Couldn't get screen details: ${e}`);
    }

    await askForPermissions();
  });
}

async function askForPermissions() {
  try {
    const status: PermissionStatus = await navigator.permissions.query({
      name: 'window-placement',
    } as any);
    switch (status.state) {
      case 'prompt':
        log('Please grant window placement permissions');
        break;
      case 'granted':
        log('Window placement permissions granted');
        break;
      case 'denied':
        log('Cannot proceed. Window placement permissions have not been granted');
        break;
    }
  } catch (e) {
    log('Something went wrong requesting window placement permissions.');
  }
}
