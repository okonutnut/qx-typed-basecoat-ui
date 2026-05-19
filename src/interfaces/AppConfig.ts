interface AppConfig {
  appName: string;
  appVersion: string;
  resources: {
    logo: string;
    userAvatar: string;
    iconsBaseUrl: string;
  };
  user: {
    name: string;
    role: string;
  };
  login: {
    title: string;
    subtitle: string;
  };
  callbacks: {
    onLogout: () => void;
    onAbout?: () => void;
    onSupport?: () => void;
    onSettings?: () => void;
    onProfile?: () => void;
  };
  sidebar: {
    width: number;
    collapsedWidth: number;
  };
}

const DEFAULT_APP_CONFIG: AppConfig = {
  appName: "APP_NAME",
  appVersion: "APP_VERSION",
  resources: {
    logo: "resource/app/app_logo.png",
    userAvatar: "resource/app/user.png",
    iconsBaseUrl: "resource/app/icons/",
  },
  user: {
    name: "User",
    role: "Role",
  },
  login: {
    title: "Company Name",
    subtitle: "Location",
  },
  callbacks: {
    onLogout: () => {},
  },
  sidebar: {
    width: 230,
    collapsedWidth: 56,
  },
};
