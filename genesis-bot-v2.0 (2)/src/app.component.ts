import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupPanelComponent } from './components/setup-panel.component';
import { SignalDisplayComponent } from './components/signal-display.component';
import { TradingViewWidgetComponent } from './components/tradingview-widget.component';
import { GeminiService } from './services/gemini.service';
import { mapToTradingViewSymbol, mapToTradingViewInterval } from './utils/tradingview-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SetupPanelComponent, SignalDisplayComponent, TradingViewWidgetComponent],
  template: `
    <div class="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      
      <!-- Top Bar -->
      <header class="bg-slate-900/90 backdrop-blur border-b border-slate-800 h-14 shrink-0 flex items-center justify-between px-4 shadow-lg z-20">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center h-8 w-8 bg-emerald-600 rounded shadow-lg shadow-emerald-500/20">
             <span class="font-bold text-white text-lg">G</span>
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight text-white leading-none">Genesis Bot <span class="text-emerald-500">V2.0</span></h1>
            <p class="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Professional Terminal</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
           <!-- Active Asset Indicator -->
           <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
             <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span class="text-xs font-mono font-bold text-slate-300">{{ currentAsset() }}</span>
             <span class="text-xs font-mono text-slate-500">|</span>
             <span class="text-xs font-mono text-emerald-400">{{ currentTimeframe() }}</span>
           </div>
        </div>
      </header>

      <!-- Main Workspace -->
      <main class="flex-1 flex overflow-hidden">
        
        <!-- Left Sidebar (Controls) -->
        <div class="w-80 bg-slate-950 border-r border-slate-800 flex flex-col z-10 shadow-2xl shrink-0 h-full overflow-y-auto">
          <div class="p-4">
            <app-setup-panel 
              [isLoading]="isAnalyzing()" 
              (requestAnalysis)="handleAnalysisRequest($event)"
            ></app-setup-panel>
          </div>
          
          <div class="mt-auto p-4 border-t border-slate-800 bg-slate-900/30">
             <div class="text-[10px] text-slate-500 font-mono leading-relaxed opacity-60">
                STATUS: AGUARDANDO COMANDO<br>
                MODELO: GEMINI 2.5 FLASH<br>
                INDICADORES: ATIVOS (EMA 9/21/50, RSI)<br>
             </div>
          </div>
        </div>

        <!-- Center/Right: Dashboard Grid -->
        <div class="flex-1 grid grid-rows-[1fr_350px] md:grid-rows-1 md:grid-cols-[1fr_380px] h-full overflow-hidden bg-slate-900">
          
          <!-- Chart Area -->
          <div class="relative w-full h-full border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950">
             <app-tradingview-widget 
                [symbol]="tvSymbol()"
                [interval]="tvInterval()">
             </app-tradingview-widget>
          </div>

          <!-- AI Analysis Area -->
          <div class="relative w-full h-full bg-slate-900/50 backdrop-blur-sm flex flex-col overflow-hidden">
            
            @if (isAnalyzing()) {
               <!-- Loading State Overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                 <div class="h-16 w-16 border-4 border-emerald-900 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                 <p class="text-emerald-400 font-mono text-xs animate-pulse">PROCESSANDO ESTRUTURA...</p>
                 <p class="text-slate-500 text-[10px] mt-1">Validando confluências</p>
              </div>
            }

            <div class="flex-1 p-4 overflow-hidden h-full">
              @if (analysisResult()) {
                <app-signal-display
                  [content]="analysisResult()!"
                  [asset]="currentAsset()"
                  [timeframe]="currentTimeframe()"
                  class="h-full block"
                ></app-signal-display>
              } @else {
                <div class="h-full flex flex-col items-center justify-center text-slate-600 opacity-60 p-8 text-center border-2 border-dashed border-slate-800 rounded-xl m-2">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Sem análise ativa</p>
                  <p class="text-[10px] mt-2">Ative o Modo Automático ou solicite manualmente para buscar sinais.</p>
                </div>
              }
            </div>
          </div>

        </div>

      </main>
    </div>
  `
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  isAnalyzing = signal(false);
  analysisResult = signal<string | null>(null);
  
  // Default State
  currentAsset = signal('EUR/USD');
  currentTimeframe = signal('M15');

  // Computed properties for TradingView
  tvSymbol = computed(() => mapToTradingViewSymbol(this.currentAsset()));
  tvInterval = computed(() => mapToTradingViewInterval(this.currentTimeframe()));

  async handleAnalysisRequest(data: {apiKey: string, asset: string, timeframe: string, observations: string}) {
    // 1. Update State (Chart updates automatically via computed/effect)
    this.currentAsset.set(data.asset);
    this.currentTimeframe.set(data.timeframe);
    
    // 2. Start AI Analysis
    this.isAnalyzing.set(true);
    // Note: We do NOT clear analysisResult immediately here so the previous result stays visible 
    // during the "thinking" phase of the next auto-loop cycle, reducing flicker. 
    // It will be replaced when the new result arrives.

    try {
      const result = await this.geminiService.analyzeMarket(
        data.apiKey,
        data.asset,
        data.timeframe,
        data.observations
      );
      this.analysisResult.set(result);
    } catch (error: any) {
      this.analysisResult.set(`⚠️ Erro: ${error.message || 'Falha na conexão.'}`);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}