import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Route = "devices" | "bbm" | "bbm-settings";
type DetailPanel = "none" | "playback" | "album";

type Device = {
  id: string;
  title: string;
  kind: "pump" | "monitor" | "row";
  tone: "pink" | "purple" | "green" | "rose" | "yellow" | "offline";
  status?: string;
  battery?: string;
  image?: string;
  product?: string;
  offline?: boolean;
  playing?: boolean;
};

const initialDevices: Device[] = [
  { id: "pump", title: "Breast Pump", kind: "pump", tone: "pink", battery: "R", playing: true },
  {
    id: "monitor",
    title: "Clara's Baby Monitor 01",
    kind: "monitor",
    tone: "purple",
    battery: "60%",
    image: "/figma/baby-monitor-crop.png",
    product: "/figma/baby-monitor-product.png",
  },
  {
    id: "cleaning-live",
    title: "Cleaning Machine",
    kind: "row",
    tone: "green",
    status: "Playing",
    image: "/figma/cleaner.png",
    playing: true,
  },
  { id: "toner", title: "Muscle Toner", kind: "row", tone: "rose", battery: "80%", image: "/figma/muscle-toner.png" },
  { id: "fd04", title: "FD04", kind: "row", tone: "yellow", image: "/figma/bottle-warmer.png" },
  {
    id: "cleaning-offline",
    title: "Cleaning Machine",
    kind: "row",
    tone: "offline",
    status: "Offline",
    image: "/figma/cleaner.png",
    offline: true,
  },
  {
    id: "purifier",
    title: "Air Purifier",
    kind: "row",
    tone: "offline",
    status: "Offline",
    image: "/figma/air-purifier.png",
    offline: true,
  },
];

function App() {
  const [route, setRoute] = useState<Route>("devices");
  const [devices, setDevices] = useState(initialDevices);
  const [activeTab, setActiveTab] = useState("Device");
  const [toast, setToast] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [bbmInlinePlaying, setBbmInlinePlaying] = useState(false);
  const [bbmLivePlaying, setBbmLivePlaying] = useState(true);
  const [bbmPanel, setBbmPanel] = useState<DetailPanel>("none");
  const [cameraControlOpen, setCameraControlOpen] = useState(false);
  const [talking, setTalking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [fullScreenLive, setFullScreenLive] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1200);
  }

  function toggleDevicePlay(id: string) {
    setDevices((current) =>
      current.map((device) => (device.id === id && !device.offline ? { ...device, playing: !device.playing } : device)),
    );
  }

  if (route === "bbm") {
    return (
      <BbmDetailPage
        cameraControlOpen={cameraControlOpen}
        fullScreenLive={fullScreenLive}
        livePlaying={bbmLivePlaying}
        musicPlaying={musicPlaying}
        panel={bbmPanel}
        recording={recording}
        talking={talking}
        onBack={() => setRoute("devices")}
        onCameraControl={() => setCameraControlOpen((value) => !value)}
        onCloseFullScreen={() => setFullScreenLive(false)}
        onFeature={(feature) => {
          if (feature === "Screenshot") showToast("Screenshot saved");
          if (feature === "Record") setRecording((value) => !value);
          if (feature === "Talk") setTalking((value) => !value);
          if (feature === "Music") setMusicPlaying((value) => !value);
          if (feature === "Night") showToast("Night view on");
        }}
        onOpenFullScreen={() => setFullScreenLive(true)}
        onOpenPanel={setBbmPanel}
        onSettings={() => setRoute("bbm-settings")}
        onToggleLive={() => setBbmLivePlaying((value) => !value)}
        onToggleMusic={() => setMusicPlaying((value) => !value)}
        onToast={showToast}
      />
    );
  }

  if (route === "bbm-settings") {
    return <BbmSettingsPage onBack={() => setRoute("bbm")} onToast={showToast} toast={toast} />;
  }

  return (
    <main className="app-shell" aria-label="Momcozy device demo">
      <div className="ambient-top" />
      <img className="ambient-line" src="/figma/bg-line.png" alt="" />
      <StatusBar time="9:41" />

      <header className="top-nav">
        <h1>Clara&apos;s Family</h1>
        <button className="add-button" aria-label="Add device" onClick={() => showToast("Ready to add a device")}>
          <PlusIcon />
        </button>
      </header>

      <section className="device-list" aria-label="Devices">
        {devices.map((device) => {
          if (device.kind === "pump") {
            return <PumpCard key={device.id} device={device} onOpen={setSelectedDevice} onToggle={toggleDevicePlay} />;
          }
          if (device.kind === "monitor") {
            return (
              <MonitorCard
                key={device.id}
                device={device}
                inlinePlaying={bbmInlinePlaying}
                onEnter={() => setRoute("bbm")}
                onToggleInline={() => setBbmInlinePlaying((value) => !value)}
              />
            );
          }
          return <DeviceRow key={device.id} device={device} onOpen={setSelectedDevice} onToggle={toggleDevicePlay} />;
        })}
      </section>

      <TabBar
        activeTab={activeTab}
        onSelect={(tab) => {
          setActiveTab(tab);
          showToast(tab);
        }}
      />

      {selectedDevice ? <DeviceSheet device={selectedDevice} onClose={() => setSelectedDevice(null)} onToggle={toggleDevicePlay} /> : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function StatusBar({ time, light = false }: { time: string; light?: boolean }) {
  return (
    <div className={`status-bar ${light ? "light" : ""}`} aria-hidden="true">
      <span className="status-time">{time}</span>
      <div className="status-levels">
        <span className="cell-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
        <WifiIcon />
        <span className="battery-icon">
          <span />
        </span>
      </div>
    </div>
  );
}

function PumpCard({ device, onOpen, onToggle }: { device: Device; onOpen: (device: Device) => void; onToggle: (id: string) => void }) {
  return (
    <article className="pump-card device-card" onClick={() => onOpen(device)}>
      <div className="pump-bg" />
      <div className="pump-head">
        <div className="pump-title">
          <span className="pump-icon">
            <PumpGlyph />
          </span>
          <h2>{device.title}</h2>
        </div>
        <PlayButton playing={Boolean(device.playing)} tone="dark-pink" onClick={() => onToggle(device.id)} />
      </div>
      <button className="timer-ring" aria-label="Open breast pump timer" onClick={(event) => event.stopPropagation()}>
        <span className="timer-progress" />
        <strong>{device.playing ? "13:00" : "13:00"}</strong>
      </button>
      <div className="pump-foot">
        <span />
        <span>M9 Pro</span>
        <span className="right-battery">
          R <BatteryTiny />
        </span>
      </div>
    </article>
  );
}

function MonitorCard({
  device,
  inlinePlaying,
  onEnter,
  onToggleInline,
}: {
  device: Device;
  inlinePlaying: boolean;
  onEnter: () => void;
  onToggleInline: () => void;
}) {
  return (
    <article className={`monitor-card device-card ${inlinePlaying ? "is-playing" : ""}`}>
      <button className="monitor-head" aria-label="Open baby monitor" onClick={onEnter}>
        <img className="monitor-product" src={device.product} alt="" />
        <div>
          <h2>{device.title}</h2>
          <div className="battery-row purple">
            <BatteryTiny /> <span>{device.battery}</span>
          </div>
        </div>
        <ChevronIcon />
      </button>
      <button className="monitor-feed" aria-label={inlinePlaying ? "Pause monitor preview" : "Play monitor preview"} onClick={onToggleInline}>
        <img src={inlinePlaying ? "/figma/bbm-live.png" : device.image} alt="Baby monitor feed" />
        <span>{inlinePlaying ? "m  •  2026-05-13 10:56:39" : "2025-01-08 11:50:55"}</span>
        <span className="inline-play-overlay">{inlinePlaying ? <PauseIcon /> : <PlayIcon />}</span>
      </button>
    </article>
  );
}

function DeviceRow({ device, onOpen, onToggle }: { device: Device; onOpen: (device: Device) => void; onToggle: (id: string) => void }) {
  return (
    <article className={`device-row ${device.tone} ${device.offline ? "is-offline" : ""}`} onClick={() => onOpen(device)}>
      <div className="row-left">
        <div className="product-tile">
          <img src={device.image} alt="" />
        </div>
        <div className="row-copy">
          <h2>{device.title}</h2>
          {device.status ? <p>{device.status}</p> : null}
          {device.battery ? (
            <div className="battery-row">
              <BatteryTiny /> <span>{device.battery}</span>
            </div>
          ) : null}
        </div>
      </div>
      {device.playing ? (
        <PlayButton playing tone="green" onClick={() => onToggle(device.id)} />
      ) : (
        <button
          className="chevron-button"
          aria-label={`Open ${device.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(device);
          }}
        >
          <ChevronIcon />
        </button>
      )}
    </article>
  );
}

function BbmDetailPage({
  cameraControlOpen,
  fullScreenLive,
  livePlaying,
  musicPlaying,
  panel,
  recording,
  talking,
  onBack,
  onCameraControl,
  onCloseFullScreen,
  onFeature,
  onOpenFullScreen,
  onOpenPanel,
  onSettings,
  onToggleLive,
  onToggleMusic,
  onToast,
}: {
  cameraControlOpen: boolean;
  fullScreenLive: boolean;
  livePlaying: boolean;
  musicPlaying: boolean;
  panel: DetailPanel;
  recording: boolean;
  talking: boolean;
  onBack: () => void;
  onCameraControl: () => void;
  onCloseFullScreen: () => void;
  onFeature: (feature: string) => void;
  onOpenFullScreen: () => void;
  onOpenPanel: (panel: DetailPanel) => void;
  onSettings: () => void;
  onToggleLive: () => void;
  onToggleMusic: () => void;
  onToast: (message: string) => void;
}) {
  return (
    <main className="bbm-page app-shell bbm-shell" aria-label="Baby Monitor">
      <div className="bbm-orb" />
      <StatusBar time="7:41" />
      <header className="bbm-topbar">
        <button className="icon-only" aria-label="Back to devices" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1>Baby Monitor</h1>
        <button className="icon-only" aria-label="Open baby monitor settings" onClick={onSettings}>
          <SlidersIcon />
        </button>
      </header>

      <section className="bbm-live" aria-label="Live monitor">
        <button className="bbm-live-media" onClick={onOpenFullScreen}>
          <img src="/figma/bbm-live.png" alt="Baby monitor live view" />
          <span className="live-watermark">m <i /> 2026-05-13 10:56:39</span>
        </button>
        <button className="live-floating-control" aria-label={livePlaying ? "Pause live video" : "Play live video"} onClick={onToggleLive}>
          {livePlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </section>

      <section className="feature-rail" aria-label="Baby monitor controls">
        <FeatureButton label="Screenshot" onClick={() => onFeature("Screenshot")}>
          <CameraIcon />
        </FeatureButton>
        <FeatureButton active={recording} label={recording ? "Recording" : "Record"} onClick={() => onFeature("Record")}>
          <VideoIcon />
        </FeatureButton>
        <FeatureButton active={talking} label={talking ? "Talking" : "Talk"} onClick={() => onFeature("Talk")}>
          <MicIcon />
        </FeatureButton>
        <FeatureButton active={cameraControlOpen} label="Control" onClick={onCameraControl}>
          <DpadIcon />
        </FeatureButton>
        <FeatureButton active={musicPlaying} label="Music" onClick={() => onFeature("Music")}>
          <MusicIcon />
        </FeatureButton>
        <FeatureButton label="Night" onClick={() => onFeature("Night")}>
          <MoonIcon />
        </FeatureButton>
      </section>

      {cameraControlOpen ? <CameraControlPad onToast={onToast} /> : null}

      <CareLog onPreview={(label) => onToast(`${label} preview`)} />

      <section className="bbm-links" aria-label="Baby monitor links">
        <button className={`bbm-link-card ${panel === "playback" ? "active" : ""}`} onClick={() => onOpenPanel(panel === "playback" ? "none" : "playback")}>
          <VideoSparkIcon />
          <span>Playback</span>
          <ChevronIcon />
        </button>
        <button className={`bbm-link-card ${panel === "album" ? "active" : ""}`} onClick={() => onOpenPanel(panel === "album" ? "none" : "album")}>
          <AlbumIcon />
          <span>Album</span>
          <ChevronIcon />
        </button>
      </section>

      {panel !== "none" ? <BbmPanel panel={panel} onClose={() => onOpenPanel("none")} /> : null}
      {musicPlaying ? <MusicBar onToggle={onToggleMusic} /> : null}
      {fullScreenLive ? <FullScreenLive livePlaying={livePlaying} onClose={onCloseFullScreen} onToggle={onToggleLive} /> : null}
      <HomeIndicator />
    </main>
  );
}

function CareLog({ onPreview }: { onPreview: (label: string) => void }) {
  const events = [
    { label: "Prone Sleeping", time: "17:00", image: "/figma/bbm-event-prone.png" },
    { label: "Crying", time: "17:00", image: "/figma/bbm-event-crying.png" },
    { label: "Face Covered", time: "17:00", image: "/figma/bbm-event-face.png" },
  ];

  return (
    <section className="care-log" aria-label="Today's Care Log">
      <div className="care-head">
        <p>Today&apos;s Care Log</p>
        <button onClick={() => onPreview("Smart Care")}>
          <SmartCareIcon /> Smart Care
        </button>
      </div>
      <div className="care-count">
        <strong>5</strong>
        <span>events</span>
      </div>
      <div className="event-strip">
        {events.map((event) => (
          <button key={event.label} className="event-card" onClick={() => onPreview(event.label)}>
            <span className="event-thumb">
              <img src={event.image} alt="" />
              <i>
                <PlayIcon />
              </i>
            </span>
            <span className="event-title">{event.label}</span>
            <span className="event-time">{event.time}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CameraControlPad({ onToast }: { onToast: (message: string) => void }) {
  return (
    <section className="camera-pad" aria-label="Camera Control">
      <button onClick={() => onToast("Camera up")}>↑</button>
      <div>
        <button onClick={() => onToast("Camera left")}>←</button>
        <button onClick={() => onToast("Camera centered")}>●</button>
        <button onClick={() => onToast("Camera right")}>→</button>
      </div>
      <button onClick={() => onToast("Camera down")}>↓</button>
    </section>
  );
}

function BbmPanel({ panel, onClose }: { panel: Exclude<DetailPanel, "none">; onClose: () => void }) {
  const title = panel === "playback" ? "Playback" : "Album";
  return (
    <section className="bbm-panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <button onClick={onClose}>Done</button>
      </div>
      <div className="panel-grid">
        <img src="/figma/bbm-event-prone.png" alt="" />
        <img src="/figma/bbm-event-crying.png" alt="" />
        <img src="/figma/bbm-event-face.png" alt="" />
      </div>
    </section>
  );
}

function MusicBar({ onToggle }: { onToggle: () => void }) {
  return (
    <section className="music-bar" aria-label="Now playing">
      <div className="music-cover">
        <MoonIcon />
      </div>
      <span>Moon Lullaby</span>
      <button aria-label="Pause lullaby" onClick={onToggle}>
        <PauseIcon />
      </button>
    </section>
  );
}

function FullScreenLive({ livePlaying, onClose, onToggle }: { livePlaying: boolean; onClose: () => void; onToggle: () => void }) {
  return (
    <section className="live-fullscreen" aria-label="Full screen live view">
      <img src="/figma/bbm-live.png" alt="Full screen baby monitor" />
      <button className="fullscreen-close" onClick={onClose}>
        Close
      </button>
      <button className="fullscreen-play" onClick={onToggle}>
        {livePlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </section>
  );
}

function BbmSettingsPage({ onBack, onToast, toast }: { onBack: () => void; onToast: (message: string) => void; toast: string }) {
  const [privacy, setPrivacy] = useState(false);
  const [crying, setCrying] = useState(true);
  const [motion, setMotion] = useState(true);

  return (
    <main className="app-shell settings-page" aria-label="Baby Monitor settings">
      <StatusBar time="7:41" />
      <header className="settings-topbar">
        <button className="icon-only" onClick={onBack} aria-label="Back">
          <ArrowLeftIcon />
        </button>
        <h1>Baby Monitor Settings</h1>
        <span />
      </header>
      <section className="settings-hero">
        <img src="/figma/baby-monitor-product.png" alt="" />
        <div>
          <h2>Clara&apos;s Baby Monitor 01</h2>
          <p>Online · 60% battery</p>
        </div>
      </section>
      <section className="settings-list">
        <ToggleRow checked={privacy} label="Privacy Mode" onChange={setPrivacy} />
        <ToggleRow checked={crying} label="Crying Detection" onChange={setCrying} />
        <ToggleRow checked={motion} label="Motion Detection" onChange={setMotion} />
        <button className="settings-row" onClick={() => onToast("Shared with family")}>
          <span>Family Sharing</span>
          <ChevronIcon />
        </button>
        <button className="settings-row" onClick={() => onToast("Firmware is up to date")}>
          <span>Firmware Update</span>
          <small>v2.8.1</small>
        </button>
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
      <HomeIndicator />
    </main>
  );
}

function ToggleRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <button className="settings-row" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className={`switch ${checked ? "on" : ""}`}>
        <i />
      </span>
    </button>
  );
}

function DeviceSheet({ device, onClose, onToggle }: { device: Device; onClose: () => void; onToggle: (id: string) => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="device-sheet" aria-label={`${device.title} detail`} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grabber" />
        <div className={`sheet-icon ${device.tone}`}>{device.image ? <img src={device.image} alt="" /> : <PumpGlyph />}</div>
        <h2>{device.title}</h2>
        <p>{device.offline ? "Offline" : device.playing ? "Playing now" : device.battery ? `Battery ${device.battery}` : "Ready"}</p>
        <div className="sheet-actions">
          <button onClick={onClose}>Close</button>
          <button className="primary" disabled={device.offline} onClick={() => onToggle(device.id)}>
            {device.playing ? "Pause" : "Start"}
          </button>
        </div>
      </section>
    </div>
  );
}

function TabBar({ activeTab, onSelect }: { activeTab: string; onSelect: (tab: string) => void }) {
  const tabs = [
    { label: "Home", icon: <HomeIcon /> },
    { label: "Device", icon: <DeviceIcon /> },
    { label: "Community", icon: <CommunityIcon /> },
    { label: "Me", icon: <MeIcon /> },
  ];
  return (
    <nav className="tab-wrap" aria-label="Primary">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button key={tab.label} className={`tab-button ${activeTab === tab.label ? "active" : ""}`} onClick={() => onSelect(tab.label)}>
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function FeatureButton({ active = false, children, label, onClick }: { active?: boolean; children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`feature-button ${active ? "active" : ""}`} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function PlayButton({ playing, tone, onClick }: { playing: boolean; tone: "dark-pink" | "green"; onClick: () => void }) {
  return (
    <button
      className={`play-button ${tone}`}
      aria-label={playing ? "Pause device" : "Start device"}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function HomeIndicator() {
  return <div className="home-indicator" aria-hidden="true" />;
}

function Svg({ children, className = "", viewBox = "0 0 24 24" }: { children: React.ReactNode; className?: string; viewBox?: string }) {
  return (
    <svg className={className} viewBox={viewBox} aria-hidden="true">
      {children}
    </svg>
  );
}

function PlusIcon() {
  return <Svg><path d="M12 5v14M5 12h14" /></Svg>;
}
function PauseIcon() {
  return <Svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="4" height="11" rx="2" /><rect x="9.5" y="2.5" width="4" height="11" rx="2" /></Svg>;
}
function PlayIcon() {
  return <Svg viewBox="0 0 16 16"><path d="M5 3.4 12 8l-7 4.6z" /></Svg>;
}
function ChevronIcon() {
  return <Svg><path d="m9 6 6 6-6 6" /></Svg>;
}
function ArrowLeftIcon() {
  return <Svg><path d="M15 5 8 12l7 7" /></Svg>;
}
function SlidersIcon() {
  return <Svg><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></Svg>;
}
function WifiIcon() {
  return <Svg className="wifi" viewBox="0 0 18 14"><path d="M2 4.8a10.2 10.2 0 0 1 14 0M5 7.8a5.8 5.8 0 0 1 8 0M8 10.6a1.5 1.5 0 0 1 2 0" /></Svg>;
}
function BatteryTiny() {
  return <Svg className="battery-tiny" viewBox="0 0 22 12"><rect x="1" y="2" width="17" height="8" rx="2" /><path d="M19 5v2" /><rect x="3.5" y="4" width="11.5" height="4" rx="1" /></Svg>;
}
function PumpGlyph() {
  return <Svg viewBox="0 0 28 28"><path d="M14 5.4a8.8 8.8 0 1 0 8.8 8.8A8.8 8.8 0 0 0 14 5.4Z" /><path d="M12 8.6c1.2-1.7 4.1-1.4 5 .7.8 1.9-.4 4.1-2.6 4.4-2.7.4-4.2-2.3-2.4-5.1Z" /><path d="M10.2 17.6c2.4 1.8 5.4 1.9 7.7 0" /></Svg>;
}
function HomeIcon() {
  return <Svg><path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></Svg>;
}
function DeviceIcon() {
  return <Svg><path d="M12 3.2 20 7.6v8.8l-8 4.4-8-4.4V7.6z" /><path d="m8.5 9.5 3.5 2 3.5-2" /></Svg>;
}
function CommunityIcon() {
  return <Svg><path d="M19 5c-5.4.2-9.5 2.7-12 7.3A7.2 7.2 0 0 0 5 18c3.5.3 6.3-.8 8.4-3.4C15.3 12.3 17 9.1 19 5Z" /><path d="M6 19c2-3.2 4.2-5.5 7-7" /></Svg>;
}
function MeIcon() {
  return <Svg><path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM4.5 21c.8-4.2 3.3-6.4 7.5-6.4s6.7 2.2 7.5 6.4Z" /></Svg>;
}
function CameraIcon() {
  return <Svg><path d="M7 8h2l1.4-2h3.2L15 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3" /></Svg>;
}
function VideoIcon() {
  return <Svg><rect x="4" y="6" width="11" height="12" rx="3" /><path d="m15 10 5-3v10l-5-3" /></Svg>;
}
function MicIcon() {
  return <Svg><path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></Svg>;
}
function DpadIcon() {
  return <Svg><path d="M12 4v5M12 15v5M4 12h5M15 12h5" /><circle cx="12" cy="12" r="2" /></Svg>;
}
function MusicIcon() {
  return <Svg><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></Svg>;
}
function MoonIcon() {
  return <Svg><path d="M19 14.4A7 7 0 0 1 9.6 5a8 8 0 1 0 9.4 9.4Z" /></Svg>;
}
function SmartCareIcon() {
  return <Svg><path d="M7 12h10M12 7v10" /><rect x="4" y="5" width="16" height="14" rx="4" /></Svg>;
}
function VideoSparkIcon() {
  return <Svg><path d="M4 7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" /><path d="m11 9 4 3-4 3V9ZM18 15l2 2M20 13v4" /></Svg>;
}
function AlbumIcon() {
  return <Svg><rect x="4" y="7" width="14" height="12" rx="3" /><path d="M7 7V5h10a3 3 0 0 1 3 3v8" /><path d="m7 15 3-3 3 3 2-2 3 3" /></Svg>;
}

createRoot(document.getElementById("root")!).render(<App />);
