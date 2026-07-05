import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
  Camera,
  CandlestickChart,
  ChevronDown,
  Info,
  LayoutGrid,
  Maximize2,
  PlusCircle,
  Redo2,
  Save,
  Search,
  Settings,
  Star,
  Undo2,
  User2,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { AssetIcon } from "@/components/trading/asset-icon";
import { AccountDropdown } from "@/components/trading/expanded/account-dropdown";
import { InstrumentSelector } from "@/components/trading/instrument-selector";
import { useExpandedTradingActions } from "@/components/trading/expanded/expanded-trading-actions";
import { displayMarketSymbol } from "@/lib/market-display";
import {
  XM_BORDER,
  XM_CARD_BG,
  XM_CHART_UTILITY_W,
  XM_HEADER_ACTION_W,
  XM_HEADER_BG,
  XM_ICON,
  XM_ICON_HOVER,
  XM_ICON_STROKE,
  XM_ROW_ACCOUNT_H,
  XM_ROW_SYMBOL_H,
  XM_ROW_TOOLBAR_H,
  XM_TEXT,
  XM_TEXT_MUTED,
} from "@/lib/xm-trading-tokens";
import { cn } from "@/lib/utils";
import type { Asset } from "@/data/markets";

export type ChartTimeframe = "1m" | "5m" | "15m" | "30m" | "1H" | "4H" | "1D";

/** Toolbar action column — pixel-matched to XM reference (rows 1–3 right side) */
const TB_ACTION_W = XM_HEADER_ACTION_W;
const TB_CIRCLE = 32;
const TB_CIRCLE_ICON = 17;
const TB_HIT = 32;
const TB_ICON = 18;
const TB_ICON_LG = 20;
const TB_DIVIDER_H = 22;

function ToolbarActionCell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-full shrink-0 items-center justify-end pr-2.5"
      style={{ width: TB_ACTION_W }}
    >
      {children}
    </div>
  );
}

function ToolbarDivider() {
  return (
    <span
      className="mx-1.5 w-px shrink-0"
      style={{ height: TB_DIVIDER_H, background: XM_BORDER }}
      aria-hidden
    />
  );
}

function ToolbarCircleBtn({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid shrink-0 place-items-center rounded-full border transition-colors hover:bg-accent"
      style={{
        width: TB_CIRCLE,
        height: TB_CIRCLE,
        borderColor: XM_BORDER,
        color: XM_ICON,
      }}
    >
      {children}
    </button>
  );
}

function ToolbarHitBtn({
  label,
  children,
  disabled,
  onClick,
  className,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid shrink-0 place-items-center rounded transition-colors hover:bg-accent disabled:opacity-35",
        className,
      )}
      style={{ width: TB_HIT, height: TB_HIT, color: XM_ICON }}
    >
      {children}
    </button>
  );
}

function ToolbarNavLink({
  label,
  to,
  children,
}: {
  label: string;
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to as never}
      className="grid shrink-0 place-items-center rounded transition-colors hover:bg-accent"
      style={{ width: TB_HIT, height: TB_HIT, color: XM_ICON }}
      aria-label={label}
    >
      {children}
    </Link>
  );
}

function HeaderRailSpacer() {
  return (
    <div
      className="shrink-0 border-l"
      style={{ width: XM_CHART_UTILITY_W, borderColor: XM_BORDER }}
      aria-hidden
    />
  );
}

const circleIcon = { width: TB_CIRCLE_ICON, height: TB_CIRCLE_ICON, strokeWidth: XM_ICON_STROKE };
const tbIcon = { width: TB_ICON, height: TB_ICON, strokeWidth: XM_ICON_STROKE };
const tbIconLg = { width: TB_ICON_LG, height: TB_ICON_LG, strokeWidth: XM_ICON_STROKE };

function LeftVDivider() {
  return (
    <span
      className="mx-1 h-5 w-px shrink-0"
      style={{ background: XM_BORDER }}
      aria-hidden
    />
  );
}

function LeftIconBtn({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid shrink-0 place-items-center rounded transition-colors hover:bg-accent disabled:opacity-35"
      style={{ width: TB_HIT, height: TB_HIT, color: XM_ICON }}
    >
      {children}
    </button>
  );
}

export function ChartTerminalHeader({
  symbol,
  onSymbolChange,
  asset,
  timeframe,
  onTimeframeChange,
  changeAbs: _changeAbs,
  changePct: _changePct,
  onExpand,
  onClose,
  isFavorite,
  onToggleFavorite,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  stackRightPanel = false,
  fullscreen = false,
}: {
  symbol: string;
  onSymbolChange?: (s: string) => void;
  asset?: Asset;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  changeAbs: number;
  changePct: number;
  onExpand?: () => void;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Status panel + utility rail sit beside rows 2–3 (below account row only) */
  stackRightPanel?: boolean;
  /** Fullscreen chart — XM logo tab bar + toolbar only */
  fullscreen?: boolean;
}) {
  const { onOpenManage } = useExpandedTradingActions();

  const gridColsFull = `minmax(0, 1fr) auto ${XM_CHART_UTILITY_W}px`;
  const gridColsMain = `minmax(0, 1fr) auto`;

  if (fullscreen) {
    return (
      <div className="shrink-0" style={{ background: XM_HEADER_BG }}>
        <ChartFullscreenTopBar
          symbol={symbol}
          asset={asset}
          onClose={onClose}
          onSymbolChange={onSymbolChange}
        />
        <ChartHeaderSymbolToolbarRows
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          asset={asset}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          onExpand={onExpand}
          onClose={onClose}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          gridCols={gridColsMain}
          showRailSpacer={false}
          showSymbolRow={false}
        />
      </div>
    );
  }

  return (
    <div className="shrink-0" style={{ background: XM_HEADER_BG }}>
      {!stackRightPanel && (
        <>
          <ChartHeaderAccountRow onOpenManage={onOpenManage} />
          <ChartHeaderSymbolToolbarRows
            symbol={symbol}
            onSymbolChange={onSymbolChange}
            asset={asset}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onExpand={onExpand}
            onClose={onClose}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            gridCols={gridColsFull}
            showRailSpacer
          />
        </>
      )}
      {stackRightPanel && (
        <ChartHeaderSymbolToolbarRows
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          asset={asset}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          onExpand={onExpand}
          onClose={onClose}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          gridCols={gridColsMain}
          showRailSpacer={false}
        />
      )}
    </div>
  );
}

/** Fullscreen top bar — XM logo + symbol tab + global actions */
function ChartFullscreenTopBar({
  symbol,
  asset,
  onClose,
  onSymbolChange,
}: {
  symbol: string;
  asset?: Asset;
  onClose?: () => void;
  onSymbolChange?: (s: string) => void;
}) {
  const label = asset ? displayMarketSymbol(asset) : `${symbol.replace("/", "")}#`;

  return (
    <div
      className="grid shrink-0 items-center border-b"
      style={{
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        height: XM_ROW_ACCOUNT_H,
        borderColor: XM_BORDER,
        background: XM_HEADER_BG,
      }}
    >
      <div className="flex h-full items-center px-3">
        <Logo mark size="sm" showRegion={false} />
      </div>

      <div className="flex h-full min-w-0 items-center px-1">
        {onSymbolChange && asset ? (
          <InstrumentSelector
            variant="header-compact"
            symbol={symbol}
            asset={asset}
            onSelect={onSymbolChange}
          />
        ) : (
          <div
            className="flex items-center gap-2 rounded-md border px-3 py-1.5"
            style={{ borderColor: XM_BORDER, background: XM_CARD_BG }}
          >
            {asset && <AssetIcon asset={asset} size="sm" />}
            <span className="text-[13px] font-semibold" style={{ color: XM_TEXT }}>
              {label}
            </span>
          </div>
        )}
      </div>

      <ToolbarActionCell>
        <div className="flex items-center" style={{ gap: 4 }}>
          <ToolbarHitBtn label="Search">
            <Search style={tbIconLg} />
          </ToolbarHitBtn>
          <ToolbarHitBtn label="Layout">
            <LayoutGrid style={tbIconLg} />
          </ToolbarHitBtn>
          {onClose && (
            <ToolbarHitBtn label="Exit fullscreen" onClick={onClose}>
              <X style={tbIcon} />
            </ToolbarHitBtn>
          )}
        </div>
      </ToolbarActionCell>
    </div>
  );
}

/** Row 1 — account + profile actions (full width incl. rail spacer) */
export function ChartHeaderAccountRow({
  onOpenManage,
  showRailSpacer = true,
}: {
  onOpenManage: () => void;
  showRailSpacer?: boolean;
}) {
  const gridColsFull = showRailSpacer
    ? `minmax(0, 1fr) auto ${XM_CHART_UTILITY_W}px`
    : `minmax(0, 1fr) auto`;

  return (
    <div
      className="grid shrink-0 items-center border-b"
      style={{
        gridTemplateColumns: gridColsFull,
        height: XM_ROW_ACCOUNT_H,
        borderColor: XM_BORDER,
        background: XM_HEADER_BG,
      }}
    >
      <div className="flex h-full items-center px-3">
        <AccountDropdown onOpenManage={onOpenManage} currency="usd" />
      </div>
      <ToolbarActionCell>
        <div className="flex items-center" style={{ gap: 4 }}>
          <ToolbarNavLink label="Notifications" to="/app/notifications">
            <Bell style={tbIconLg} />
          </ToolbarNavLink>
          <ToolbarNavLink label="Wallet" to="/app/wallet">
            <Wallet style={tbIconLg} />
          </ToolbarNavLink>
          <ToolbarNavLink label="Profile" to="/app/profile">
            <User2 style={tbIconLg} />
          </ToolbarNavLink>
        </div>
      </ToolbarActionCell>
      {showRailSpacer && <HeaderRailSpacer />}
    </div>
  );
}

function ChartHeaderSymbolToolbarRows({
  symbol,
  onSymbolChange,
  asset,
  timeframe,
  onTimeframeChange,
  onExpand,
  onClose,
  isFavorite,
  onToggleFavorite,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  gridCols,
  showRailSpacer,
  showSymbolRow = true,
}: {
  symbol: string;
  onSymbolChange?: (s: string) => void;
  asset?: Asset;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  onExpand?: () => void;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  gridCols: string;
  showRailSpacer: boolean;
  showSymbolRow?: boolean;
}) {
  return (
    <>
      {showSymbolRow && (
      <div
        className="grid shrink-0 items-center border-b"
        style={{
          gridTemplateColumns: gridCols,
          height: XM_ROW_SYMBOL_H,
          borderColor: XM_BORDER,
        }}
      >
        <div className="flex h-full min-w-0 items-center gap-2 px-3">
          {onSymbolChange && asset ? (
            <>
              <InstrumentSelector
                variant="header-compact"
                symbol={symbol}
                asset={asset}
                onSelect={onSymbolChange}
              />
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className="grid shrink-0 place-items-center rounded hover:bg-accent"
                  style={{ width: TB_HIT, height: TB_HIT, color: isFavorite ? XM_ICON_HOVER : XM_ICON }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    style={tbIconLg}
                    className={cn(isFavorite && "fill-current")}
                  />
                </button>
              )}
            </>
          ) : (
            <span className="text-[15px] font-bold" style={{ color: XM_TEXT }}>
              {symbol.replace("/", "")}#
            </span>
          )}
        </div>

        <ToolbarActionCell>
          <div className="flex items-center">
            <div className="flex items-center" style={{ gap: 4 }}>
              <ToolbarCircleBtn label="Info">
                <Info style={circleIcon} />
              </ToolbarCircleBtn>
              <ToolbarCircleBtn label="Settings">
                <Settings style={circleIcon} />
              </ToolbarCircleBtn>
              <ToolbarCircleBtn label="Add">
                <PlusCircle style={circleIcon} />
              </ToolbarCircleBtn>
            </div>
            <ToolbarDivider />
            {onClose ? (
              <ToolbarHitBtn label="Close" onClick={onClose}>
                <X style={tbIcon} />
              </ToolbarHitBtn>
            ) : (
              <ToolbarHitBtn label="Fullscreen" onClick={onExpand}>
                <Maximize2 style={tbIcon} />
              </ToolbarHitBtn>
            )}
          </div>
        </ToolbarActionCell>
        {showRailSpacer && <HeaderRailSpacer />}
      </div>
      )}

      {/* Row 3 — chart toolbar */}
      <div
        className="grid shrink-0 items-center border-b"
        style={{
          gridTemplateColumns: gridCols,
          height: XM_ROW_TOOLBAR_H,
          borderColor: XM_BORDER,
        }}
      >
        <div className="flex h-full min-w-0 items-center overflow-x-auto px-2">
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as ChartTimeframe)}
            className="h-8 shrink-0 cursor-pointer rounded bg-transparent px-2 text-[13px] font-medium outline-none hover:bg-accent"
            style={{ color: XM_TEXT_MUTED }}
          >
            {(["1m", "5m", "15m", "30m", "1H", "4H", "1D"] as ChartTimeframe[]).map((t) => (
              <option key={t} value={t} style={{ background: XM_HEADER_BG }}>
                {t}
              </option>
            ))}
          </select>

          <LeftVDivider />

          <LeftIconBtn label="Chart type">
            <CandlestickChart style={tbIconLg} />
          </LeftIconBtn>

          <LeftVDivider />

          <button
            type="button"
            className="flex h-8 shrink-0 items-center gap-1 rounded px-2 text-[13px] hover:bg-accent"
            style={{ color: XM_TEXT_MUTED }}
          >
            <span className="text-[11px] italic" style={{ color: XM_ICON }}>
              fx
            </span>
            <span style={{ color: XM_TEXT }}>Indicators</span>
          </button>

          <LeftIconBtn label="Templates">
            <LayoutGrid style={tbIconLg} />
          </LeftIconBtn>

          <LeftIconBtn label="Compare">
            <PlusCircle style={tbIconLg} />
          </LeftIconBtn>

          <LeftVDivider />

          <LeftIconBtn label="Undo" disabled={!canUndo} onClick={onUndo}>
            <Undo2 style={tbIconLg} />
          </LeftIconBtn>
          <LeftIconBtn label="Redo" disabled={!canRedo} onClick={onRedo}>
            <Redo2 style={tbIconLg} />
          </LeftIconBtn>
        </div>

        <ToolbarActionCell>
          <div className="flex h-full items-center">
            <ToolbarHitBtn label="Layout">
              <span
                className="rounded-full border"
                style={{ width: 18, height: 18, borderColor: XM_ICON }}
              />
            </ToolbarHitBtn>

            <span className="shrink-0" style={{ width: 24 }} aria-hidden />

            <button
              type="button"
              className="flex shrink-0 items-center rounded transition-colors hover:bg-accent"
              style={{
                height: TB_HIT,
                gap: 4,
                color: "var(--foreground)",
                fontSize: 13,
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              <Save style={{ width: TB_ICON, height: TB_ICON, strokeWidth: XM_ICON_STROKE }} />
              <span>Save</span>
              <ChevronDown
                style={{ width: 14, height: 14, strokeWidth: XM_ICON_STROKE, color: XM_ICON }}
              />
            </button>

            <span className="shrink-0" style={{ width: 20 }} aria-hidden />

            <ToolbarHitBtn label="Settings">
              <Settings style={tbIcon} />
            </ToolbarHitBtn>

            <span className="shrink-0" style={{ width: 16 }} aria-hidden />

            <ToolbarHitBtn label="Screenshot">
              <Camera style={tbIcon} />
            </ToolbarHitBtn>
          </div>
        </ToolbarActionCell>
        {showRailSpacer && <HeaderRailSpacer />}
      </div>
    </>
  );
}
