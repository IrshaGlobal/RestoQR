import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export function KeyboardShortcutsDialog() {
  const shortcuts = [
    { keys: ['M'], label: 'Toggle sound notifications' },
    { keys: ['K'], label: 'Toggle kitchen mode' },
    { keys: ['Esc'], label: 'Exit kitchen mode' },
    { keys: ['1'], label: 'Start preparing first order' },
    { keys: ['F'], label: 'Toggle fullscreen' },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 hover:bg-[#00F0FF]/10 transition-all rounded-none border-2 border-[#00F0FF]/30 hover:border-[#00F0FF] group"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-5 h-5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black border-2 border-[#00F0FF]/40 rounded-none shadow-2xl shadow-[#00F0FF]/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-wider text-white font-mono">
            <span className="text-[#00F0FF]">//</span> KEYBOARD COMMANDS
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 hover:border-[#00F0FF]/50 transition-colors">
              <kbd className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-bold text-[#00F0FF] bg-black border-2 border-[#00F0FF] rounded-none font-mono">
                {shortcut.keys[0]}
              </kbd>
              <span className="text-sm text-white/70 font-mono">{shortcut.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-4 text-center font-mono">
          Press these keys anywhere (not when typing in inputs)
        </p>
      </DialogContent>
    </Dialog>
  )
}
