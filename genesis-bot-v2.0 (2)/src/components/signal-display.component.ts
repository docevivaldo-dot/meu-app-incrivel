import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-signal-display',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  providers: [provideMarkdown()],
  template: `
    <div class="h-full flex flex-col gap-4">
      <!-- Status Header -->
      <div [class]="statusClasses()" class="border-l-4 rounded-r-lg p-4 shadow-lg flex items-center justify-between shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/20 tracking-widest">
              {{ asset() }}
            </span>
            <span class="text-[10px] font-mono text-white/60">
               {{ timestamp | date:'HH:mm:ss' }}
            </span>
          </div>
          <h1 class="text-2xl font-black tracking-tighter flex items-center gap-2">
             @if (signalType() === 'BUY') {
              <span class="text-green-400">🟢 COMPRA</span>
            } @else if (signalType() === 'SELL') {
              <span class="text-red-400">🔴 VENDA</span>
            } @else {
              <span class="text-yellow-400">🟡 AGUARDAR</span>
            }
          </h1>
        </div>
        
        <div class="text-right">
           <div class="mb-1">
              <span class="text-[10px] uppercase opacity-60 font-bold block">Força</span>
              <span class="font-bold text-sm">{{ strength() }}</span>
           </div>
           <div>
              <span class="text-[10px] uppercase opacity-60 font-bold block">Prob.</span>
              <span class="font-mono font-bold text-sm">{{ probability() }}</span>
           </div>
        </div>
      </div>

      <!-- Analysis Content -->
      <div class="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-inner flex-1 overflow-y-auto scrollbar-thin">
        <h3 class="text-slate-500 text-[10px] font-bold uppercase mb-3 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gênesis AI Log
        </h3>
        <div class="prose prose-invert prose-xs max-w-none prose-headings:text-slate-300 prose-p:text-slate-400 prose-strong:text-emerald-400">
          <markdown [data]="content()"></markdown>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 2px; }
  `]
})
export class SignalDisplayComponent {
  content = input.required<string>();
  asset = input.required<string>();
  timeframe = input.required<string>();
  
  timestamp = new Date();

  signalType = computed(() => {
    const text = this.content();
    if (text.includes('🟢') || text.includes('COMPRA') || text.includes('CALL')) return 'BUY';
    if (text.includes('🔴') || text.includes('VENDA') || text.includes('PUT')) return 'SELL';
    return 'WAIT';
  });

  strength = computed(() => {
    const match = this.content().match(/Força:\s*([^\n]+)/i);
    return match ? match[1].trim() : '-';
  });

  probability = computed(() => {
    const match = this.content().match(/Probabilidade(?: estimada)?:\s*([^\n]+)/i);
    return match ? match[1].trim() : '-';
  });

  statusClasses = computed(() => {
    switch (this.signalType()) {
      case 'BUY': return 'bg-green-950/40 border-green-500 text-green-100';
      case 'SELL': return 'bg-red-950/40 border-red-500 text-red-100';
      default: return 'bg-yellow-950/40 border-yellow-500 text-yellow-100';
    }
  });
}