type BsToastCategory = "success" | "info" | "warning" | "error";

type BsToastAction = {
  label: string;
  href?: string;
  onclick?: (close: () => void) => void;
};

type BsToastConfig = {
  duration?: number;
  category?: BsToastCategory;
  title: string;
  description?: string;
  action?: BsToastAction;
  cancel?: {
    label?: string;
    onclick?: () => void;
  };
};

class BsToast {
  private static __toaster: HTMLDivElement | null = null;
  private static __toasts: Map<number, { timeout: number; close: () => void }> = new Map();
  private static __toastId = 0;

  private constructor() {}

  static show(config: BsToastConfig): void {
    const toaster = BsToast.__getOrCreateToaster();
    const toast = BsToast.__createToastElement(config);
    toaster.appendChild(toast);

    const duration = config.duration ?? (config.category === "error" ? 5000 : 3000);
    const toastId = BsToast.__toastId++;

    const close = () => {
      clearTimeout(BsToast.__toasts.get(toastId)?.timeout);
      BsToast.__toasts.delete(toastId);
      toast.remove();
    };

    const timeout = window.setTimeout(close, duration);
    BsToast.__toasts.set(toastId, { timeout, close });
  }

  static info(title: string, description?: string): void {
    BsToast.show({ title, description, category: "info" });
  }

  static success(title: string, description?: string): void {
    BsToast.show({ title, description, category: "success" });
  }

  static warning(title: string, description?: string): void {
    BsToast.show({ title, description, category: "warning" });
  }

  static error(title: string, description?: string): void {
    BsToast.show({ title, description, category: "error" });
  }

  private static __createToastElement(config: BsToastConfig): HTMLDivElement {
    const toast = document.createElement("div");
    toast.className = `toast`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-atomic", "true");
    toast.setAttribute("aria-hidden", "false");
    if (config.category) {
      toast.setAttribute("data-category", config.category);
    }
    if (config.duration) {
      toast.setAttribute("data-duration", config.duration.toString());
    }

    const content = document.createElement("div");
    content.className = "toast-content";

    if (config.category) {
      const icon = BsToast.__getCategoryIcon(config.category);
      content.appendChild(icon);
    }

    const section = document.createElement("section");

    const title = document.createElement("h2");
    title.textContent = config.title;
    section.appendChild(title);

    if (config.description) {
      const desc = document.createElement("p");
      desc.textContent = config.description;
      section.appendChild(desc);
    }

    content.appendChild(section);

    if (config.action) {
      const footer = document.createElement("footer");

      if (config.action.href) {
        const link = document.createElement("a");
        link.href = config.action.href;
        link.className = "btn btn-sm-primary";
        link.textContent = config.action.label;
        footer.appendChild(link);
      } else if (config.action.onclick) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-sm-primary";
        btn.textContent = config.action.label;
        btn.onclick = (e) => {
          e.preventDefault();
          config.action!.onclick!(() => {
            toast.remove();
          });
        };
        footer.appendChild(btn);
      }

      content.appendChild(footer);
    }

    if (config.cancel) {
      const footer = content.querySelector("footer") || document.createElement("footer");
      footer.className = "";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-sm-outline";
      cancelBtn.textContent = config.cancel.label ?? "Dismiss";
      if (config.cancel.onclick) {
        cancelBtn.onclick = (e) => {
          e.preventDefault();
          config.cancel!.onclick!();
          toast.remove();
        };
      } else {
        cancelBtn.onclick = (e) => {
          e.preventDefault();
          toast.remove();
        };
      }
      footer.appendChild(cancelBtn);

      if (!content.querySelector("footer")) {
        content.appendChild(footer);
      }
    }

    toast.appendChild(content);
    return toast;
  }

  private static __getCategoryIcon(category: BsToastCategory): HTMLElement {
    const iconContainer = document.createElement("div");
    iconContainer.setAttribute("aria-hidden", "true");

    const icons: Record<BsToastCategory, string> = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    };

    iconContainer.innerHTML = icons[category];
    return iconContainer;
  }

  private static __getOrCreateToaster(): HTMLDivElement {
    if (BsToast.__toaster) return BsToast.__toaster;

    const toaster = document.createElement("div");
    toaster.id = "bs-toaster";
    toaster.className = "toaster";
    toaster.setAttribute("data-align", "end");
    document.body.appendChild(toaster);

    BsToast.__toaster = toaster;
    return toaster;
  }
}