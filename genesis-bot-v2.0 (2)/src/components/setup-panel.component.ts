import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-xl flex flex-col gap-6">
      
      <!-- Header -->
      <h2 class="text-emerald-500 text-lg font-bold tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Painel de Controle
      </h2>

      <!-- Inputs -->
      <div class="space-y-4">
        <!-- API Key -->
        <div>
          <label class="block text-slate-400 text-xs uppercase font-bold mb-1">Google Gemini API Key</label>
          <input 
            type="password" 
            [(ngModel)]="apiKey"
            placeholder="Cole a sua chave aqui..."
            class="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Asset -->
          <div>
            <label class="block text-slate-400 text-xs uppercase font-bold mb-1">Ativo</label>
            <select 
              [(ngModel)]="selectedAsset"
              class="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 text-sm"
            >
              <optgroup label="Forex">
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="USD/JPY">USD/JPY</option>
                <option value="USD/CHF">USD/CHF</option>
                <option value="AUD/USD">AUD/USD</option>
                <option value="EUR/JPY">EUR/JPY</option>
                <option value="GBP/JPY">GBP/JPY</option>
              </optgroup>
              <optgroup label="Crypto">
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
              </optgroup>
              <optgroup label="Indices">
                <option value="US100 (NASDAQ)">NASDAQ (US100)</option>
                <option value="US500 (S&P500)">S&P 500 (US500)</option>
                <option value="US30 (DOW)">DOW JONES (US30)</option>
                <option value="GER40 (DAX)">DAX (GER40)</option>
              </optgroup>
            </select>
          </div>

          <!-- Timeframe -->
          <div>
            <label class="block text-slate-400 text-xs uppercase font-bold mb-1">Timeframe</label>
            <select 
              [(ngModel)]="selectedTimeframe"
              class="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="M1">M1 (1 Min)</option>
              <option value="M3">M3 (3 Min)</option>
              <option value="M5">M5 (5 Min)</option>
              <option value="M15">M15 (15 Min)</option>
              <option value="M30">M30 (30 Min)</option>
              <option value="H1">H1 (1 Hora)</option>
            </select>
          </div>
        </div>

        <!-- Auto Mode Toggle -->
        <div class="bg-slate-950/50 p-3 rounded border border-slate-800">
           <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-bold text-slate-200 block">Modo Automático</span>
                <span class="text-[10px] text-slate-500 block">Analisa a cada 60s em busca de sinais</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="isAutoMode" (change)="toggleAutoMode()" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
           </div>
           @if (isAutoMode()) {
             <div class="mt-2 flex items-center gap-2 text-[10px] text-emerald-400 font-mono animate-pulse">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                SCANNER ATIVO - BUSCANDO OPORTUNIDADES...
             </div>
           }
        </div>

        <!-- Action Button -->
        <button 
          (click)="onAnalyze()"
          [disabled]="isLoading() || !apiKey()"
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
        >
          @if (isLoading()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analisando...
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ isAutoMode() ? 'Forçar Análise' : 'Solicitar Análise' }}
          }
        </button>
      </div>
    </div>
  `
})
export class SetupPanelComponent {
  // Inputs/Outputs
  isLoading = input<boolean>(false);
  requestAnalysis = output<{apiKey: string, asset: string, timeframe: string, observations: string}>();

  // State
  apiKey = signal('');
  selectedAsset = signal('EUR/USD');
  selectedTimeframe = signal('M15');
  isAutoMode = signal(false);
  
  private timer: any = null;

  toggleAutoMode() {
    if (this.isAutoMode()) {
      // Enabled
      this.onAnalyze(); // Initial run
      this.timer = setInterval(() => {
        // Only trigger if not currently loading
        if (!this.isLoading() && this.apiKey()) {
          this.onAnalyze();
        }
      }, 60000); // 60 seconds interval
    } else {
      // Disabled
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  onAnalyze() {
    if (this.apiKey()) {
      this.requestAnalysis.emit({
        apiKey: this.apiKey(),
        asset: this.selectedAsset(),
        timeframe: this.selectedTimeframe(),
        observations: '' // Auto mode doesn't use manual observations typically
      });
    }
  }
}