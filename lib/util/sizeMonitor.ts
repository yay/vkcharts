type Size = {
  width: number;
  height: number;
};
type OnSizeChange = (size: Size, element: HTMLElement) => void;
type Entry = {
  cb: OnSizeChange;
  size?: Size;
};

export class SizeMonitor {
  private static elements = new Map<HTMLElement, Entry>();
  private static resizeObserver: any;
  private static ready = false;

  static init() {
    const NativeResizeObserver = (window as any).ResizeObserver;

    if (NativeResizeObserver) {
      SizeMonitor.resizeObserver = new NativeResizeObserver((entries: any) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          SizeMonitor.checkSize(SizeMonitor.elements.get(entry.target), entry.target, width, height);
        }
      });
    } else {
      // polyfill (more reliable even in browsers that support ResizeObserver)
      const step = () => {
        SizeMonitor.elements.forEach((entry, element) => {
          const width = element.clientWidth ? element.clientWidth : 0;
          const height = element.clientHeight ? element.clientHeight : 0;
          SizeMonitor.checkSize(entry, element, width, height);
        });
      };
      window.setInterval(step, 100);
    }

    SizeMonitor.ready = true;
  }

  private static checkSize(entry: Entry | undefined, element: HTMLElement, width: number, height: number) {
    if (entry) {
      if (!entry.size || width !== entry.size.width || height !== entry.size.height) {
        entry.size = { width, height };
        entry.cb(entry.size, element);
      }
    }
  }

  // Only a single callback is supported.
  static observe(element: HTMLElement, cb: OnSizeChange) {
    if (!SizeMonitor.ready) {
      SizeMonitor.init();
    }
    SizeMonitor.unobserve(element);
    if (SizeMonitor.resizeObserver) {
      SizeMonitor.resizeObserver.observe(element);
    }
    SizeMonitor.elements.set(element, { cb });
  }

  static unobserve(element: HTMLElement) {
    if (SizeMonitor.resizeObserver) {
      SizeMonitor.resizeObserver.unobserve(element);
    }
    SizeMonitor.elements.delete(element);
  }
}
