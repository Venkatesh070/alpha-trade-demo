import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; onReset?: () => void };
type State = { error: Error | null };

/** Catches trading-terminal crashes and shows the real error instead of the generic root page. */
export class TradingErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[TradingTerminal]", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-background p-6">
        <div className="max-w-lg rounded-xl border border-destructive/40 bg-surface p-6 text-left">
          <h2 className="text-lg font-semibold text-foreground">Trading terminal failed to load</h2>
          <p className="mt-2 font-mono text-sm text-destructive">{error.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset?.();
            }}
            className="gold-button hover:gold-button-hover mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
