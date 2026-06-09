import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Route = "devices" | "pump" | "bbm" | "bbm-settings";
type DetailPanel = "none" | "playback" | "album";
type BbmCardState = "idle" | "connecting" | "controls" | "playing" | "sleep" | "error";
type PumpCardState = "empty" | "running" | "paused" | "complete" | "details";

type Device = {
  id: string;
  title: string;
  kind: "pump" | "monitor" | "row";
  tone: "pink" | "purple" | "green" | "rose" | "yellow" | "white" | "offline";
  status?: string;
  battery?: string;
  mode?: string;
  humidity?: string;
  image?: string;
  product?: string;
  visual?: "meggo" | "earbuds" | "diffuser" | "humidifier";
  offline?: boolean;
  playing?: boolean;
};

const initialDevices: Device[] = [
  { id: "pump", title: "Breast Pump", kind: "pump", tone: "pink" },
  {
    id: "monitor",
    title: "Clara's Baby Monitor 01",
    kind: "monitor",
    tone: "purple",
    battery: "60%",
    image: "figma/baby-monitor-crop-2x.png",
    product: "figma/baby-monitor-product.png",
  },
  {
    id: "cleaning-live",
    title: "Cleaning Machine",
    kind: "row",
    tone: "green",
    status: "Playing",
    image: "figma/cleaner.png",
    playing: true,
  },
  { id: "meggo", title: "MeggO", kind: "row", tone: "rose", status: "Rest Day", visual: "meggo" },
  { id: "t31", title: "T31", kind: "row", tone: "white", battery: "80%", visual: "earbuds" },
  { id: "wn02", title: "WN02", kind: "row", tone: "white", battery: "75%", mode: "Rain", visual: "diffuser" },
  { id: "plusecare1", title: "PluseCare1", kind: "row", tone: "rose", battery: "80%", image: "figma/muscle-toner.png" },
  { id: "humidifier", title: "Humidifier", kind: "row", tone: "green", humidity: "55%", visual: "humidifier", playing: true },
];

function App() {
  const [route, setRoute] = useState<Route>("devices");
  const [devices, setDevices] = useState(initialDevices);
  const [activeTab, setActiveTab] = useState("Device");
  const [toast, setToast] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [bbmCardState, setBbmCardState] = useState<BbmCardState>("idle");
  const [bbmMuted, setBbmMuted] = useState(true);
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
        toast={toast}
      />
    );
  }

  if (route === "bbm-settings") {
    return <BbmSettingsPage onBack={() => setRoute("bbm")} onToast={showToast} toast={toast} />;
  }

  if (route === "pump") {
    return <PumpFlowPage onBack={() => setRoute("devices")} onDone={() => setRoute("devices")} />;
  }

  return (
    <PixelDevicePage
      devices={devices}
      activeTab={activeTab}
      bbmCardState={bbmCardState}
      bbmMuted={bbmMuted}
      selectedDevice={selectedDevice}
      toast={toast}
      onAdd={() => showToast("Ready to add a device")}
      onEnterBbm={() => setRoute("bbm")}
      onBbmCardStateChange={setBbmCardState}
      onToggleBbmMuted={() => setBbmMuted((value) => !value)}
      onUnavailableCard={(title) => showToast(`${title}: Card preview only`)}
      onOpenDevice={setSelectedDevice}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        showToast(tab);
      }}
      onToggleDevice={toggleDevicePlay}
      onCloseSheet={() => setSelectedDevice(null)}
    />
  );
}

function PixelDevicePage({
  activeTab,
  bbmCardState,
  bbmMuted,
  devices,
  selectedDevice,
  toast,
  onAdd,
  onBbmCardStateChange,
  onCloseSheet,
  onEnterBbm,
  onOpenDevice,
  onSelectTab,
  onToggleBbmMuted,
  onToggleDevice,
  onUnavailableCard,
}: {
  activeTab: string;
  bbmCardState: BbmCardState;
  bbmMuted: boolean;
  devices: Device[];
  selectedDevice: Device | null;
  toast: string;
  onAdd: () => void;
  onBbmCardStateChange: (state: BbmCardState) => void;
  onCloseSheet: () => void;
  onEnterBbm: () => void;
  onOpenDevice: (device: Device) => void;
  onSelectTab: (tab: string) => void;
  onToggleBbmMuted: () => void;
  onToggleDevice: (id: string) => void;
  onUnavailableCard: (title: string) => void;
}) {
  const pumpDevice = devices.find((device) => device.id === "pump");
  const monitorDevice = devices.find((device) => device.id === "monitor");
  const restDevices = devices.slice(2);

  return (
    <main className="app-shell pixel-shell device-shell" aria-label="Momcozy device demo">
      <img className="device-bg-line" src="figma/bg-line.png" alt="" />
      <StatusBar time="9:41" />
      <header className="top-nav">
        <h1>Clara's Family</h1>
        <button className="add-button" aria-label="Add device" onClick={onAdd}>
          <PlusIcon />
        </button>
      </header>

      <section className="device-list" aria-label="Devices">
        {pumpDevice ? (
          <PumpCard device={pumpDevice} />
        ) : null}
        {monitorDevice ? (
          <MonitorCard
            device={monitorDevice}
            muted={bbmMuted}
            previewState={bbmCardState}
            onEnter={onEnterBbm}
            onPreviewStateChange={onBbmCardStateChange}
            onToggleMuted={onToggleBbmMuted}
          />
        ) : null}
        {restDevices.map((device) =>
          device.id === "cleaning-live" ? (
            <CleaningMachineCard key={device.id} device={device} onToggle={onToggleDevice} />
          ) : (
            <DeviceReferenceCard key={device.id} device={device} onToggle={onToggleDevice} onUnavailable={onUnavailableCard} />
          ),
        )}
      </section>

      <TabBar activeTab={activeTab} onSelect={onSelectTab} />
      {activeTab !== "Device" ? <div className="toast tab-toast">{activeTab}</div> : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function PumpFlowPage({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        if (value >= 10) {
          window.clearInterval(timer);
          return 10;
        }
        return value + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const complete = elapsed >= 10;

  return (
    <main className="app-shell pump-flow-shell" aria-label="Breast Pump flow">
      <div className="pump-flow-bg" />
      <StatusBar time="9:41" />
      <header className="pump-flow-topbar">
        <button className="icon-only pump-back" aria-label="Back to devices" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1>Breast Pump</h1>
        <span />
      </header>

      <section className={`pump-flow-card ${complete ? "is-complete" : ""}`} aria-live="polite">
        <PumpCardHeader />
        {complete ? <PumpMilkData onDone={onDone} /> : <PumpRunning elapsed={elapsed} onFinish={() => setElapsed(10)} />}
      </section>
      <HomeIndicator />
    </main>
  );
}

function PumpCardHeader() {
  return (
    <div className="pump-flow-head">
      <span className="pump-flow-icon">
        <PumpGlyph />
      </span>
      <div>
        <h2>Breast Pump</h2>
        <span>3 Devices</span>
      </div>
    </div>
  );
}

function PumpRunning({ elapsed, onFinish }: { elapsed: number; onFinish: () => void }) {
  const progress = elapsed / 10;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="pump-running">
      <div className="pump-progress-ring" style={{ "--progress": `${progress * 360}deg` } as React.CSSProperties}>
        <div>
          <strong>
            {mm}:{ss}
          </strong>
          <span>Rhythm Mode</span>
        </div>
      </div>
      <div className="pump-running-meta">
        <span>M9 Pro</span>
        <span>
          R <BatteryTiny />
        </span>
      </div>
      <button className="pump-finish-button" onClick={onFinish}>
        Finish
      </button>
    </div>
  );
}

function PumpMilkData({ onDone }: { onDone: () => void }) {
  return (
    <div className="pump-data">
      <div className="pump-data-hero">
        <span className="pump-flower">*</span>
        <h2>You did it, mama.</h2>
        <p>Another bottle, made with love.</p>
      </div>
      <div className="milk-card">
        <p>Last Pump</p>
        <div className="milk-card-main">
          <strong>0</strong>
          <span>m ago</span>
        </div>
        <div className="milk-stats">
          <span>
            <small>Last Time</small>
            00:10
          </span>
          <span>
            <small>Last Volume</small>
            120ml
          </span>
        </div>
      </div>
      <button className="pump-finish-button" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

function BbmPixelPage({
  cameraControlOpen,
  fullScreenLive,
  livePlaying,
  musicPlaying,
  panel,
  recording,
  talking,
  toast,
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
  toast: string;
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
    <main className="app-shell pixel-shell bbm-pixel-shell" aria-label="Baby Monitor">
      <section className="pixel-reference bbm-reference" aria-label="Baby Monitor details">
        <img src="figma/bbm-detail-reference.png" alt="" />
        <button className="hotspot bbm-back-hotspot" aria-label="Back to devices" onClick={onBack} />
        <button className="hotspot bbm-settings-hotspot" aria-label="Open baby monitor settings" onClick={onSettings} />
        <button className="hotspot bbm-live-hotspot" aria-label="Open full screen live view" onClick={onOpenFullScreen} />
        <button className="hotspot bbm-screenshot-hotspot" aria-label="Screenshot" onClick={() => onFeature("Screenshot")} />
        <button className="hotspot bbm-record-hotspot" aria-label="Record" onClick={() => onFeature("Record")} />
        <button className="hotspot bbm-talk-hotspot" aria-label="Talk" onClick={() => onFeature("Talk")} />
        <button className="hotspot bbm-control-hotspot" aria-label="Camera control" onClick={onCameraControl} />
        <button className="hotspot bbm-music-hotspot" aria-label="Music" onClick={() => onFeature("Music")} />
        <button className="hotspot bbm-smart-hotspot" aria-label="Smart Care" onClick={() => onToast("Smart Care preview")} />
        <button className="hotspot event-prone-hotspot" aria-label="Prone Sleeping preview" onClick={() => onToast("Prone Sleeping preview")} />
        <button className="hotspot event-crying-hotspot" aria-label="Crying preview" onClick={() => onToast("Crying preview")} />
        <button className="hotspot event-face-hotspot" aria-label="Face Covered preview" onClick={() => onToast("Face Covered preview")} />
        <button className="hotspot playback-hotspot" aria-label="Open playback" onClick={() => onOpenPanel(panel === "playback" ? "none" : "playback")} />
        <button className="hotspot album-hotspot" aria-label="Open album" onClick={() => onOpenPanel(panel === "album" ? "none" : "album")} />
        <div className="bbm-pixel-states" aria-hidden="true">
          {recording ? <span className="state-pill record">Recording</span> : null}
          {talking ? <span className="state-pill talk">Talking</span> : null}
          {!livePlaying ? (
            <span className="pixel-live-paused">
              <PlayIcon />
            </span>
          ) : null}
        </div>
      </section>

      {cameraControlOpen ? <CameraControlPad onToast={onToast} /> : null}
      {panel !== "none" ? (
        <BbmPanel
          panel={panel}
          onClose={() => onOpenPanel("none")}
          onOpenFullScreen={onOpenFullScreen}
          onPreview={(event) => onToast(`${event.label} preview`)}
        />
      ) : null}
      {musicPlaying ? <LullabiesPanel onClose={onToggleMusic} onToast={onToast} /> : null}
      {fullScreenLive ? <FullScreenLive livePlaying={livePlaying} onClose={onCloseFullScreen} onToggle={onToggleLive} /> : null}
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

function PumpCard({ device }: { device: Device }) {
  const [state, setState] = useState<PumpCardState>("empty");
  const [elapsed, setElapsed] = useState(0);
  const running = state === "running";
  const leftProgress = Math.min(elapsed / 5, 1);
  const rightProgress = Math.min(elapsed / 10, 1);

  useEffect(() => {
    if (!running) return undefined;
    const startedAt = window.performance.now() - elapsed * 1000;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min((window.performance.now() - startedAt) / 1000, 10);
      setElapsed(nextElapsed);
      if (nextElapsed >= 10) {
        window.clearInterval(timer);
        setState("complete");
      }
    }, 80);

    return () => window.clearInterval(timer);
  }, [running]);

  function startPump() {
    setElapsed(0);
    setState("running");
  }

  function handleCardClick() {
    if (state === "empty") startPump();
    if (state === "complete") setState("details");
    if (state === "details") startPump();
  }

  function togglePause(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setState((current) => (current === "running" ? "paused" : "running"));
  }

  return (
    <article
      className={`pump-card device-card pump-card-${state}`}
      onClick={handleCardClick}
      style={
        {
          "--left-progress": `${leftProgress * 360}deg`,
          "--right-progress": `${rightProgress * 360}deg`,
        } as React.CSSProperties
      }
    >
      <div className="pump-bg" />
      <div className="pump-head">
        <div className="pump-title">
          <span className="pump-icon">
            <PumpGlyph />
          </span>
          <h2>{device.title}</h2>
        </div>
        {state === "running" || state === "paused" ? (
          <button className="pump-pause-button" aria-label={state === "paused" ? "Resume breast pump" : "Pause breast pump"} onClick={togglePause}>
            {state === "paused" ? <PlayIcon /> : <PauseIcon />}
          </button>
        ) : (
          <>
            <span className="pump-device-count">3 Devices</span>
            <ChevronIcon />
          </>
        )}
      </div>
      {state === "empty" ? (
        <>
          <div className="pump-empty-copy">
            No breast feeding
            <br />
            record available
          </div>
          <PumpEmptyIllustration />
        </>
      ) : null}
      {state === "running" || state === "paused" ? <PumpSessionView paused={state === "paused"} /> : null}
      {state === "complete" ? <PumpCompleteView onDetails={() => setState("details")} /> : null}
      {state === "details" ? <PumpDetailsView /> : null}
    </article>
  );
}

function PumpSessionView({ paused }: { paused: boolean }) {
  return (
    <>
      <div className={`pump-session ${paused ? "is-paused" : ""}`} aria-label={paused ? "Breast pump paused" : "Breast pump running"}>
        <PumpSideTimer side="left" label="13:00" />
        <PumpSideTimer side="right" label="10:00" />
      </div>
      {paused ? <span className="pump-paused-label">Paused</span> : null}
      <PumpBatteryFooter />
    </>
  );
}

function PumpSideTimer({ side, label }: { side: "left" | "right"; label: string }) {
  return (
    <div className={`pump-side-timer ${side}`}>
      <span className="pump-side-ring" />
      <strong>{label}</strong>
    </div>
  );
}

function PumpBatteryFooter() {
  return (
    <div className="pump-battery-footer">
      <span>
        L <BatteryTiny />
      </span>
      <span>M9 Pro</span>
      <span>
        R <BatteryTiny />
      </span>
    </div>
  );
}

function PumpCompleteView({ onDetails }: { onDetails: () => void }) {
  return (
    <div className="pump-complete-body">
      <PumpFlowerIcon />
      <strong>You did it, mama.</strong>
      <span>Another bottle, made with love.</span>
      <button
        className="pump-details-button"
        aria-label="Open breast pump details"
        onClick={(event) => {
          event.stopPropagation();
          onDetails();
        }}
      >
        Details
      </button>
    </div>
  );
}

function PumpDetailsView() {
  return (
    <>
      <div className="pump-data-summary">
        <span className="pump-data-label">Last Pump</span>
        <div className="pump-last-pump">
          <strong>1</strong>
          <span>h</span>
          <strong>45</strong>
          <span>m ago</span>
        </div>
        <div className="pump-data-metrics">
          <span>
            <small>Last Time</small>
            09:35am
          </span>
          <span>
            <small>Last Volume</small>
            680ml
          </span>
        </div>
      </div>
      <PumpEmptyIllustration />
    </>
  );
}

function MonitorCard({
  device,
  muted,
  previewState,
  onEnter,
  onPreviewStateChange,
  onToggleMuted,
}: {
  device: Device;
  muted: boolean;
  previewState: BbmCardState;
  onEnter: () => void;
  onPreviewStateChange: (state: BbmCardState) => void;
  onToggleMuted: () => void;
}) {
  const streamVisible = previewState === "controls" || previewState === "playing" || previewState === "connecting" || previewState === "sleep";
  const showControlLayer = previewState === "controls";
  const showCleanStream = previewState === "playing";
  const isSoftFrame = previewState === "idle" || previewState === "sleep" || previewState === "connecting";
  const canEnterDetails = previewState !== "connecting";

  useEffect(() => {
    if (previewState !== "connecting") return undefined;
    const timer = window.setTimeout(() => onPreviewStateChange("controls"), 900);
    return () => window.clearTimeout(timer);
  }, [onPreviewStateChange, previewState]);

  useEffect(() => {
    if (previewState !== "controls") return undefined;
    const timer = window.setTimeout(() => onPreviewStateChange("playing"), 3000);
    return () => window.clearTimeout(timer);
  }, [onPreviewStateChange, previewState]);

  function startStream() {
    onPreviewStateChange("connecting");
  }

  function handleCardClick() {
    if (canEnterDetails) onEnter();
  }

  function handleMediaClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (previewState === "controls") {
      onPreviewStateChange("playing");
      return;
    }
    if (previewState === "playing") {
      onPreviewStateChange("controls");
      return;
    }
    if (previewState !== "connecting") startStream();
  }

  function handleReconnect(event: React.MouseEvent) {
    event.stopPropagation();
    startStream();
  }

  return (
    <article className={`monitor-card device-card state-${previewState}`} onClick={handleCardClick}>
      <button
        className="monitor-head"
        aria-label="Open baby monitor"
        onClick={(event) => {
          event.stopPropagation();
          onEnter();
        }}
      >
        <img className="monitor-product" src={device.product} alt="" />
        <div>
          <h2>{device.title}</h2>
          <div className="battery-row purple">
            <BatteryTiny /> <span>{device.battery}</span>
          </div>
        </div>
        <ChevronIcon />
      </button>
      <div
        className="monitor-feed"
        role="button"
        tabIndex={0}
        aria-label="Baby monitor preview"
        onClick={handleMediaClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (previewState === "controls") {
              onPreviewStateChange("playing");
            } else if (previewState === "playing") {
              onPreviewStateChange("controls");
            } else if (previewState !== "connecting") {
              startStream();
            }
          }
        }}
      >
        <img className={isSoftFrame ? "is-soft-frame" : ""} src={streamVisible ? device.image : device.image} alt="Baby monitor feed" />
        {previewState !== "idle" && previewState !== "error" ? <span className="monitor-watermark">2025-01-08 11:50:55</span> : null}
        {previewState === "idle" ? (
          <span className="bbm-center-play">
            <PlayIcon />
          </span>
        ) : null}
        {previewState === "connecting" ? (
          <span className="bbm-connecting">
            <span className="bbm-loading-shield">
              <ShieldTinyIcon />
            </span>
            <strong>
              Secure
              <br />
              Connection
            </strong>
            <small>Connecting with end-to-end encryption...</small>
          </span>
        ) : null}
        {previewState === "sleep" ? (
          <span className="bbm-wake-pill">
            Tap to wake camera
            <i>
              <EyeTinyIcon />
            </i>
          </span>
        ) : null}
        {previewState === "error" ? (
          <span className="bbm-error-panel">
            <span>Please check the device status.</span>
            <button onClick={handleReconnect}>Reconnect</button>
          </span>
        ) : null}
        {showControlLayer ? (
          <span className="bbm-stream-controls">
            <button
              aria-label={muted ? "Unmute monitor preview" : "Mute monitor preview"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleMuted();
                onPreviewStateChange("controls");
              }}
            >
              <VolumeTinyIcon muted={muted} />
            </button>
            <button
              aria-label="Pause monitor preview"
              onClick={(event) => {
                event.stopPropagation();
                onPreviewStateChange("playing");
              }}
            >
              <PauseIcon />
            </button>
            <button
              aria-label="Open full monitor view"
              onClick={(event) => {
                event.stopPropagation();
                onEnter();
              }}
            >
              <ExpandTinyIcon />
            </button>
          </span>
        ) : null}
        {showCleanStream ? <span className="sr-only">Monitor preview is playing</span> : null}
      </div>
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

function CleaningMachineCard({ device, onToggle }: { device: Device; onToggle: (id: string) => void }) {
  const playing = Boolean(device.playing);

  return (
    <article className="cleaning-card" aria-label={`Cleaning Machine ${playing ? "Playing" : "Pause"}`}>
      <div className="cleaning-product-tile">
        <img src={device.image} alt="" />
      </div>
      <div className="cleaning-copy">
        <h2>Cleaning Machine</h2>
        <p>{playing ? "Playing" : "Pause"}</p>
      </div>
      <button
        className="cleaning-toggle"
        aria-label={playing ? "Pause Cleaning Machine" : "Start Cleaning Machine"}
        onClick={() => onToggle(device.id)}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    </article>
  );
}

function DeviceReferenceCard({
  device,
  onToggle,
  onUnavailable,
}: {
  device: Device;
  onToggle: (id: string) => void;
  onUnavailable: (title: string) => void;
}) {
  const isHumidifier = device.id === "humidifier";

  return (
    <article
      className={`reference-device-card ${device.tone} ${device.visual ?? ""}`}
      role="button"
      tabIndex={0}
      aria-label={device.title}
      onClick={() => onUnavailable(device.title)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onUnavailable(device.title);
        }
      }}
    >
      <div className="reference-product-tile">
        <ProductVisual device={device} />
      </div>
      <div className="reference-copy">
        <h2>{device.title}</h2>
        <div className="reference-meta">
          {device.status ? <span className="rest-day">{device.status}</span> : null}
          {device.battery ? (
            <span className="reference-battery">
              <BatteryTiny /> {device.battery}
            </span>
          ) : null}
          {device.humidity ? (
            <span className="reference-humidity">
              <DropIcon /> {device.humidity}
            </span>
          ) : null}
          {device.mode ? (
            <span className="reference-mode">
              <span aria-hidden="true" /> {device.mode}
            </span>
          ) : null}
        </div>
      </div>
      {isHumidifier ? (
        <button
          className="reference-power-button"
          aria-label={device.playing ? "Turn off Humidifier" : "Turn on Humidifier"}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(device.id);
          }}
        >
          <PowerIcon />
        </button>
      ) : (
        <button
          className="reference-chevron"
          aria-label={`${device.title} card unavailable`}
          onClick={(event) => {
            event.stopPropagation();
            onUnavailable(device.title);
          }}
        >
          <ChevronIcon />
        </button>
      )}
    </article>
  );
}

function ProductVisual({ device }: { device: Device }) {
  if (device.image) {
    return <img className="reference-product-image" src={device.image} alt="" />;
  }

  if (device.visual === "meggo") {
    return (
      <div className="product-visual meggo-visual" aria-hidden="true">
        <span className="meggo-face" />
        <span className="meggo-ring" />
      </div>
    );
  }

  if (device.visual === "earbuds") {
    return (
      <div className="product-visual earbuds-visual" aria-hidden="true">
        <span className="earbud-case" />
        <span className="earbud left" />
        <span className="earbud right" />
      </div>
    );
  }

  if (device.visual === "diffuser") {
    return (
      <div className="product-visual diffuser-visual" aria-hidden="true">
        <span className="diffuser-glow" />
        <span className="diffuser-body" />
        <span className="diffuser-base" />
      </div>
    );
  }

  return (
    <div className="product-visual humidifier-visual" aria-hidden="true">
      <span className="humidifier-mist" />
      <span className="humidifier-body" />
      <span className="humidifier-base" />
    </div>
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
  toast,
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
  toast: string;
}) {
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  function handleFeature(feature: string) {
    if (feature === "Screenshot") {
      setScreenshotFlash(true);
      window.setTimeout(() => setScreenshotFlash(false), 1500);
    }
    if (feature === "Record" && recording) {
      onToast("Recording saved");
    }
    if (feature === "PiP") {
      onToast("Picture-in-picture is not available in this demo");
      return;
    }
    if (feature === "Music") {
      onToast("Lullabies are not available in this demo");
      return;
    }
    if (feature === "Night") {
      setNightMode((value) => !value);
      onToast(nightMode ? "Night view off" : "Night view on");
      return;
    }
    onFeature(feature);
  }

  return (
    <main className={`bbm-page app-shell bbm-shell ${nightMode ? "night-mode" : ""}`} aria-label="Baby Monitor">
      <div className="bbm-orb" />
      <StatusBar time="7:41" />
      <header className="bbm-topbar">
        <button className="icon-only" aria-label="Back to devices" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1>Baby Monitor</h1>
        <button className="icon-only" aria-label="Open baby monitor settings" onClick={() => onToast("Settings are not available in this demo")}>
          <SlidersIcon />
        </button>
      </header>

      <section className="bbm-live" aria-label="Live monitor">
        <button className="bbm-live-media" onClick={() => onToast("Live detail is not available in this demo")}>
          <img src="figma/bbm-live.png" alt="Baby monitor live view" />
          <span className="live-watermark">m <i /> 2026-05-13 10:56:39</span>
          {nightMode ? <span className="night-vision-badge"><MoonIcon /> Night</span> : null}
        </button>
        {recording ? <span className="recording-pill"><i />06:00</span> : null}
        {talking ? <span className="talking-pill"><MicIcon /> Speaking</span> : null}
        {recording ? (
          <div className="live-inline-tools" aria-label="Recording controls">
            <button aria-label="Mute recording"><VolumeTinyIcon muted /></button>
            <button>HD⌄</button>
            <button aria-label="Open full screen recording" onClick={() => onToast("Full screen is not available in this demo")}><ExpandTinyIcon /></button>
          </div>
        ) : null}
        <button className="live-floating-control" aria-label={livePlaying ? "Pause live video" : "Play live video"} onClick={onToggleLive}>
          {livePlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </section>

      <section className="feature-rail" aria-label="Baby monitor controls">
        <FeatureButton label="Screenshot" onClick={() => handleFeature("Screenshot")}>
          <CameraIcon />
        </FeatureButton>
        <FeatureButton active={recording} label={recording ? "Recording" : "Record"} onClick={() => handleFeature("Record")}>
          <VideoIcon />
        </FeatureButton>
        <FeatureButton active={talking} label={talking ? "Talking" : "Talk"} onClick={() => handleFeature("Talk")}>
          <MicIcon />
        </FeatureButton>
        <FeatureButton active={cameraControlOpen} label="Control" onClick={onCameraControl}>
          <DpadIcon />
        </FeatureButton>
        <FeatureButton active={musicPlaying} label="Music" onClick={() => handleFeature("Music")}>
          <MusicIcon />
        </FeatureButton>
        <FeatureButton label="Picture in picture" onClick={() => handleFeature("PiP")}>
          <PictureInPictureIcon />
        </FeatureButton>
        <FeatureButton active={nightMode} label="Night" onClick={() => handleFeature("Night")}>
          <MoonIcon />
        </FeatureButton>
      </section>

      {cameraControlOpen ? <CameraControlPad onToast={onToast} /> : null}

      <CareLog onPreview={(event) => onToast(`${event.label} details are not available`)} />

      <section className="bbm-links" aria-label="Baby monitor links">
        <button className="bbm-link-card" onClick={() => onToast("Playback is not available in this demo")}>
          <VideoSparkIcon />
          <span>Playback</span>
          <ChevronIcon />
        </button>
        <button className="bbm-link-card" onClick={() => onToast("Album is not available in this demo")}>
          <AlbumIcon />
          <span>Album</span>
          <ChevronIcon />
        </button>
      </section>

      {screenshotFlash ? (
        <div className="screenshot-flash" aria-live="polite">
          <img src="figma/bbm-live.png" alt="" />
        </div>
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
      <HomeIndicator />
    </main>
  );
}

const playbackEvents = [
  { label: "Movement", time: "6:56", image: "figma/bbm-event-prone.png" },
  { label: "Crying", time: "7:12", image: "figma/bbm-event-crying.png" },
  { label: "Face covered", time: "7:28", image: "figma/bbm-event-face.png" },
];

const albumItems = [
  { kind: "Video", time: "Today 17:00", image: "figma/bbm-event-prone.png" },
  { kind: "Photo", time: "Today 16:42", image: "figma/bbm-event-crying.png" },
  { kind: "Video", time: "Yesterday 22:18", image: "figma/bbm-event-face.png" },
  { kind: "Photo", time: "Yesterday 18:06", image: "figma/bbm-live.png" },
];

function CareLog({ onPreview }: { onPreview: (event: { label: string; image: string }) => void }) {
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const events = [
    { label: "Prone Sleeping", time: "17:00", image: "figma/bbm-event-prone.png" },
    { label: "Crying", time: "17:00", image: "figma/bbm-event-crying.png" },
    { label: "Face Covered", time: "17:00", image: "figma/bbm-event-face.png" },
  ];

  function showEventDetected() {
    setSnapshotLoading(true);
    window.setTimeout(() => setSnapshotLoading(false), 1400);
  }

  return (
    <section className="care-log" aria-label="Today's Care Log">
      <div className="care-head">
        <p>Today&apos;s Care Log</p>
        <button onClick={showEventDetected}>
          <SmartCareIcon /> Smart Care
        </button>
      </div>
      <div className="care-count">
        <strong>5</strong>
        <span>events</span>
      </div>
      <div className="event-strip">
        {events.map((event) => (
          <button key={event.label} className={`event-card ${snapshotLoading && event.label === "Prone Sleeping" ? "loading" : ""}`} onClick={() => {
            if (snapshotLoading && event.label === "Prone Sleeping") return;
            onPreview(event);
          }}>
            <span className="event-thumb">
              {snapshotLoading && event.label === "Prone Sleeping" ? (
                <span className="event-loading-state">
                  <b />
                  <em>Event detected<br />Snapshot loading</em>
                </span>
              ) : (
                <>
                  <img src={event.image} alt="" />
                  <i>
                    <PlayIcon />
                  </i>
                </>
              )}
            </span>
            <span className="event-title">{event.label}</span>
            <span className="event-time">{event.time}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function EventPreview({ event, onClose }: { event: { label: string; image: string }; onClose: () => void }) {
  return (
    <section className="event-preview" aria-label={`${event.label} preview`}>
      <img className="event-preview-bg" src={event.image} alt="" />
      <StatusBar time="7:41" light />
      <header className="event-preview-topbar">
        <button className="icon-only" aria-label="Back to Baby Monitor" onClick={onClose}>
          <ArrowLeftIcon />
        </button>
        <h2>{event.label}</h2>
        <button className="icon-only" aria-label="Close preview" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>
      <div className="event-preview-media">
        <img src={event.image} alt="" />
        <span className="live-watermark">m <i /> 2026-05-13 10:56:39</span>
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

function BbmPanel({
  panel,
  onClose,
  onOpenFullScreen,
  onPreview,
}: {
  panel: Exclude<DetailPanel, "none">;
  onClose: () => void;
  onOpenFullScreen: () => void;
  onPreview: (event: { label: string; image: string }) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [albumFilter, setAlbumFilter] = useState<"All" | "Video" | "Photo">("All");
  const title = panel === "playback" ? "Smart Playback" : "Album";
  const visibleAlbumItems = albumItems.filter((item) => albumFilter === "All" || item.kind === albumFilter);

  return (
    <section className={`bbm-panel ${panel}`}>
      <div className="panel-head">
        <h2>{title}</h2>
        <button onClick={onClose}>Done</button>
      </div>
      {panel === "playback" ? (
        <>
          <div className="date-strip">
            <button aria-label="Previous day">‹</button>
            <button className="date-pill active" onClick={() => setShowDatePicker(true)}>
              <strong>19</strong>
              <span>Apr</span>
            </button>
            <button className="date-pill" onClick={() => setShowDatePicker(true)}>
              <strong>20</strong>
              <span>Apr</span>
            </button>
            <button className="date-pill" onClick={() => setShowDatePicker(true)}>
              <strong>21</strong>
              <span>Apr</span>
            </button>
            <button aria-label="Next day">›</button>
          </div>
          <div className="playback-preview">
            <img src="figma/bbm-live.png" alt="" />
            <button aria-label="Play playback preview" onClick={onOpenFullScreen}>
              <PlayIcon />
            </button>
            <span>6:56 Movement</span>
          </div>
          <div className="playback-timeline" aria-label="Playback timeline">
            <i style={{ left: "20%", width: "5%" }} />
            <i style={{ left: "43%", width: "8%" }} />
            <i style={{ left: "60%", width: "3%" }} />
            <i style={{ left: "68%", width: "7%" }} />
            <b style={{ left: "45%" }} />
          </div>
          <div className="timeline-labels">
            <span>5:32</span>
            <span>6:02</span>
            <span>6:32</span>
            <span>7:02</span>
            <span>7:32</span>
          </div>
          <div className="playback-events">
            {playbackEvents.map((event) => (
              <button key={event.label} onClick={() => onPreview(event)}>
                <img src={event.image} alt="" />
                <span>
                  <strong>{event.label}</strong>
                  <small>{event.time}</small>
                </span>
                <PlayIcon />
              </button>
            ))}
          </div>
          {showDatePicker ? <DatePickerPanel onClose={() => setShowDatePicker(false)} /> : null}
        </>
      ) : (
        <>
          <div className="album-tabs" role="tablist" aria-label="Album filter">
            {(["All", "Video", "Photo"] as const).map((filter) => (
              <button key={filter} className={albumFilter === filter ? "active" : ""} onClick={() => setAlbumFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
          <div className="panel-grid album-grid">
            {visibleAlbumItems.map((item) => (
              <button key={`${item.kind}-${item.time}`} className="album-thumb" onClick={() => onPreview({ label: `${item.kind} ${item.time}`, image: item.image })}>
                <img src={item.image} alt="" />
                <span>{item.kind}</span>
                <small>{item.time}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function DatePickerPanel({ onClose }: { onClose: () => void }) {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dates = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "01", "02", "03", "04", "05"];

  return (
    <div className="date-picker-backdrop">
      <section className="date-picker-panel" aria-label="Date Selection">
        <header>
          <span />
          <h3>Date Selection</h3>
          <button aria-label="Close date selection" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="calendar-month">
          <button aria-label="Previous month">‹</button>
          <strong>April 2026</strong>
          <button aria-label="Next month">›</button>
        </div>
        <div className="calendar-grid">
          {days.map((day) => <b key={day}>{day}</b>)}
          {dates.map((date, index) => (
            <button key={`${date}-${index}`} className={`${date === "19" ? "selected" : ""} ${index > 29 ? "muted" : ""}`} onClick={onClose}>
              {date}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function PipPreview({ onClose, onConnectionLost }: { onClose: () => void; onConnectionLost: () => void }) {
  return (
    <section className="pip-preview" aria-label="Picture in picture preview">
      <button className="pip-media" onClick={onConnectionLost}>
        <img src="figma/bbm-live.png" alt="" />
        <span>m 10:56</span>
      </button>
      <button className="pip-close" aria-label="Close picture in picture" onClick={onClose}>
        <CloseIcon />
      </button>
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

function LullabiesPanel({ onClose, onToast }: { onClose: () => void; onToast: (message: string) => void }) {
  const [loading, setLoading] = useState(true);
  const songs = ["Moon Lullaby", "Cotton Cloud", "Little Stars, Close Your Eyes", "Cotton Cloud", "The Sleepy River Song"];

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 720);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className={`lullabies-panel ${loading ? "loading" : ""}`} aria-label="Lullabies">
      <header className="lullabies-topbar">
        <button className="icon-only" aria-label="Close lullabies" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2>Lullabies</h2>
        <span />
      </header>
      <div className="lullaby-list">
        {songs.map((song, index) => (
          <button key={`${song}-${index}`} className="lullaby-row" onClick={() => onToast(loading ? "Loading lullabies" : `${song} selected`)}>
            <span className="lullaby-cover">
              <MoonIcon />
            </span>
            <span>{song}</span>
            {loading && index === 0 ? <span className="lullaby-spinner" /> : index === 0 ? <PauseIcon /> : <PlayIcon />}
          </button>
        ))}
      </div>
      <div className="lullaby-volume" aria-label="Volume">
        <VolumeTinyIcon muted={false} />
        <span>
          <i />
        </span>
        <VolumeTinyIcon muted={false} />
      </div>
      <div className="lullaby-controls">
        <button aria-label="Repeat lullaby">
          <MusicIcon />
        </button>
        <button className="lullaby-play" aria-label="Pause lullaby">
          {loading ? <PlayIcon /> : <PauseIcon />}
          <span>{loading ? "Play" : "Pause"}</span>
        </button>
      </div>
    </section>
  );
}

function FullScreenLive({ livePlaying, onClose, onToggle }: { livePlaying: boolean; onClose: () => void; onToggle: () => void }) {
  return (
    <section className="live-fullscreen" aria-label="Full screen live view">
      <img src="figma/bbm-live.png" alt="Full screen baby monitor" />
      <span className="fullscreen-watermark">m 2026-05-13 10:56:39</span>
      <div className="fullscreen-recording"><i /> 06:00</div>
      <div className="fullscreen-top-controls">
        <button aria-label="Mute"><VolumeTinyIcon muted /></button>
        <button>HD⌄</button>
        <button aria-label="Delete recording"><CloseIcon /></button>
        <button aria-label="Download recording">↓</button>
        <button aria-label="Share recording">↗</button>
        <button aria-label="Exit full screen" onClick={onClose}><ExpandTinyIcon /></button>
      </div>
      <button className="fullscreen-play" aria-label={livePlaying ? "Pause full screen live" : "Play full screen live"} onClick={onToggle}>
        {livePlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="fullscreen-bottom-controls">
        <div className="fullscreen-mode-toggle">
          <button aria-label="Screenshot"><CameraIcon /></button>
          <button className="active" aria-label="Record"><VideoIcon /></button>
          <button>1x</button>
        </div>
        <div className="fullscreen-timeline">
          <i style={{ left: "18%", width: "7%" }} />
          <i style={{ left: "43%", width: "10%" }} />
          <i style={{ left: "62%", width: "3%" }} />
          <i style={{ left: "70%", width: "7%" }} />
          <b style={{ left: "43%" }} />
        </div>
        <div className="fullscreen-time-labels">
          <span>5:32</span>
          <span>6:02</span>
          <span>6:32</span>
          <span>7:02</span>
          <span>7:32</span>
        </div>
        <span className="fullscreen-tooltip">6:56 Movement</span>
      </div>
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
        <img src="figma/baby-monitor-product.png" alt="" />
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
function DropIcon() {
  return <Svg className="drop-icon" viewBox="0 0 16 16"><path d="M8 1.8c2.8 3.2 4.2 5.6 4.2 7.4A4.2 4.2 0 0 1 3.8 9.2C3.8 7.4 5.2 5 8 1.8Z" /></Svg>;
}
function PowerIcon() {
  return <Svg><path d="M12 3v8" /><path d="M7.2 6.2a6 6 0 1 0 9.6 0" /></Svg>;
}
function PumpGlyph() {
  return <Svg viewBox="0 0 28 28"><path d="M14 5.4a8.8 8.8 0 1 0 8.8 8.8A8.8 8.8 0 0 0 14 5.4Z" /><path d="M12 8.6c1.2-1.7 4.1-1.4 5 .7.8 1.9-.4 4.1-2.6 4.4-2.7.4-4.2-2.3-2.4-5.1Z" /><path d="M10.2 17.6c2.4 1.8 5.4 1.9 7.7 0" /></Svg>;
}
function PumpFlowerIcon() {
  return (
    <Svg className="pump-flower-icon" viewBox="0 0 48 42">
      <path d="M23.2 18.3c-4.5-9.2-.3-16.8 5.5-15.8 4.2.8 5.2 6.7 1.4 12.9 7.1-5.3 14.5-3.1 15.5 2.3.9 5.2-5.8 8.5-13.9 6.7 6.8 5.7 4.3 12.9-1.4 14-4.9.9-7.4-4.7-5.3-11.9-5.4 8.5-14.5 9.2-16.5 4.1-1.7-4.5 3.9-9 12.1-9.7-8.8-1.2-12-7.8-8.4-11.8 3.3-3.7 8.7-.9 11 9.2Z" />
      <circle cx="25" cy="21.2" r="3.4" />
    </Svg>
  );
}
function PumpEmptyIllustration() {
  return (
    <Svg className="pump-empty-illustration" viewBox="0 0 300 210">
      <path d="M93 203c-.4-44.2 14.6-78.5 45-103 14.2-11.4 24.6-18.5 31.2-31.5" />
      <path d="M173 63.4c-7.7-4.5-10-16.8-6-27.5 4.3-11.7 16.9-17 31.8-12.7 19.5 5.6 26.8 22.3 21 39.7-5.3 16.1-20.4 23.2-34.1 17.5" />
      <path d="M195 84c16.4 9.4 36.5 11.2 55 19.3 15.4 6.7 29.3 13.6 41.6 20.7" />
      <path d="M169.8 65.8c-5 11-14 16.8-22.3 16.2-9.7-.8-17.7-10.4-18.9-23.4-1.6-17.3 7.6-27.6 23.7-26.3 14.3 1.2 24.2 10.5 23.5 22.2" />
      <path d="M130.6 48.3c5.6-6.6 19.8-7.5 32.8-3 9.7 3.4 18.4 9.7 23.4 18.9" />
      <path d="M134 58.2c-.6 7.2-1.2 12.4-1.8 15.4" />
      <path d="M154.6 65.6c-1.4 7.8-6.2 12.3-14.5 13.4" />
      <path d="M172.5 47.5c8.8-2.6 15.7-.9 20.6 5.2 4.5 5.6 4.1 11.7-1.1 18.4" />
      <path d="M177.3 68.8c7.7.8 12.6 3.5 14.6 8.1 1.7 4.1.2 7.5-4.7 10.2" />
      <path d="M166 96.5c-5.2 20.8-4.1 37.3 3.4 49.4 9.6 15.5 25.2 23.2 46.6 23.2 22.7 0 38.1-8.2 46.3-24.7 5.7-11.4 5-23.4-2-36" />
      <path d="M167.3 124.1c14.8-7.7 28.7-7.7 41.7 0 8.7 5.1 14.6 14.3 17.9 27.5" />
      <path d="M226.9 151.6c4.3-15.5 12.5-26.8 24.6-33.9 9.9-5.8 21.1-7.8 33.5-6" />
      <path d="M176.8 132.9c12.1-5.6 24-2.6 35.8 9" />
      <path d="M236.6 139.2c5.7-10.1 14.7-16.4 27-18.9" />
      <path d="M236.2 114.8c-3.9-3.8-7.4-5.9-10.5-6.2" />
      <path d="M84.8 11.9c-3 14.4 2.5 24.8 16.5 31.2 10.9 4.9 21.2 5.2 31 1" />
      <path d="M232.8 122.8c25.6 11.7 39.1 25.3 40.5 40.8" />
      <path d="M252.5 182.9c12.1 19.4 27.6 24.4 46.5 15" />
      <path d="M265.2 173.8c10.9 18.7 24.9 23.8 42 15.3" />
      <path d="M276.9 163.4c9.4 15.4 20.6 20 33.5 13.7" />
      <path d="M287.6 151.7c8.7 12 17.2 15.4 25.5 10.2" />
      <path d="M271 189.4c-13.8 1.8-26-7.6-36.5-28.1-5.2-10.1-2.6-20.5 7.8-31.2 11.6-11.9 24.3-19 38.1-21.4" />
      <path d="M254.9 133.6c13.2 8.5 28 20 44.4 34.6 5.8 5.2 8.1 10.2 7 15.1-1.3 5.5-6.6 7.8-15.9 6.9" />
      <path d="M263.2 119.8c9.1 5.3 18.1 11.7 27 19.2 7.5 6.3 11.3 11.5 11.6 15.6.3 4.5-2.5 7.7-8.4 9.8" />
      <path d="M270.2 106.8c9.3 5.8 17.2 11.9 23.7 18.3 5.3 5.2 7.8 9.9 7.3 14.2-.5 4.6-3.7 7.1-9.5 7.7" />
      <path d="M290.4 111.6c-3.8-7.7-2.7-13.9 3.2-18.6 2.4-1.9 5.7-1.5 9.8 1.2" />
    </Svg>
  );
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
function PictureInPictureIcon() {
  return <Svg><rect x="4" y="5" width="16" height="14" rx="3" /><rect x="11" y="11" width="6" height="4" rx="1" /></Svg>;
}
function CloseIcon() {
  return <Svg><path d="m6 6 12 12M18 6 6 18" /></Svg>;
}
function ShieldTinyIcon() {
  return <Svg viewBox="0 0 16 16"><path d="M8 2.2 12.5 4v3.3c0 3-1.8 5.5-4.5 6.5C5.3 12.8 3.5 10.3 3.5 7.3V4Z" /><path d="M8 6v3" /><path d="M8 11h.01" /></Svg>;
}
function VolumeTinyIcon({ muted }: { muted: boolean }) {
  return (
    <Svg viewBox="0 0 20 20">
      <path d="M3 8v4h3l4 3V5L6 8Z" />
      {muted ? <path d="m14 8 4 4M18 8l-4 4" /> : <path d="M13 7.5c1.2 1.4 1.2 3.6 0 5M15.5 5.5a7 7 0 0 1 0 9" />}
    </Svg>
  );
}
function ExpandTinyIcon() {
  return <Svg viewBox="0 0 20 20"><path d="M7 3H3v4M13 3h4v4M17 13v4h-4M3 13v4h4" /></Svg>;
}
function EyeTinyIcon() {
  return <Svg viewBox="0 0 16 16"><path d="M1.8 8s2.2-4 6.2-4 6.2 4 6.2 4-2.2 4-6.2 4-6.2-4-6.2-4Z" /><path d="M8 6.5a1.5 1.5 0 1 1 0 3" /></Svg>;
}

const rootElement = document.getElementById("root")! as HTMLElement & { reactRoot?: ReturnType<typeof createRoot> };
rootElement.reactRoot = rootElement.reactRoot ?? createRoot(rootElement);
rootElement.reactRoot.render(<App />);
