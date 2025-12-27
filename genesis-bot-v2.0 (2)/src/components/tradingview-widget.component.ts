import { Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const TradingView: any;

@Component({
  selector: 'app-tradingview-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
      <div #containerId id="tradingview_container" class="w-full h-full"></div>
      
      <!-- Loading Overlay (removed once chart loads theoretically, but TV doesn't emit easy events, so we rely on z-index) -->
      @if (!scriptLoaded) {
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
           <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      }
    </div>
  `
})
export class TradingViewWidgetComponent {
  symbol = input.required<string>();
  interval = input.required<string>();
  container = viewChild<ElementRef>('containerId');
  
  scriptLoaded = false;

  constructor() {
    this.loadScript();
    
    // React to input changes
    effect(() => {
      const s = this.symbol();
      const i = this.interval();
      if (this.scriptLoaded) {
        this.initWidget(s, i);
      }
    });
  }

  loadScript() {
    if (document.getElementById('tv-script')) {
      this.scriptLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'tv-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      this.scriptLoaded = true;
      this.initWidget(this.symbol(), this.interval());
    };
    document.head.appendChild(script);
  }

  initWidget(symbol: string, interval: string) {
    if (typeof TradingView === 'undefined' || !this.container()) return;

    new TradingView.widget({
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1", // Candles
      "locale": "br",
      "toolbar_bg": "#0f172a",
      "enable_publishing": false,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_container",
      "studies": [
        { id: "MASimple@tv-basicstudies", inputs: { length: 9 } },
        { id: "MASimple@tv-basicstudies", inputs: { length: 21 } },
        { id: "MASimple@tv-basicstudies", inputs: { length: 50 } },
        { id: "RSI@tv-basicstudies", inputs: { length: 14 } }
      ],
      "overrides": {
        "paneProperties.background": "#020617",
        "paneProperties.vertGridProperties.color": "#1e293b",
        "paneProperties.horzGridProperties.color": "#1e293b",
        "scalesProperties.textColor": "#94a3b8"
      }
    });
  }
}