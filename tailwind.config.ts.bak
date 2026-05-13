import type { Config } from 'tailwindcss'

const colors = [
    'primary', 'secondary', 'success', 'info', 'warning', 'error',
    'lime', 'blue', 'orange', 'purple', 'red', 'yellow', 'amber',
    'green', 'emerald', 'teal', 'cyan', 'sky', 'indigo', 'violet',
    'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'stone'
]

export default <Partial<Config>>{
    safelist: colors.flatMap(color => [
        `shadow-${color}-500/50`,
        `shadow-${color}-500/30`,
        `drop-shadow-${color}-500`,
        `bg-${color}-500`,
        `bg-${color}-500/10`,
        `ring-${color}-500/50`,
        `text-${color}-500`
    ]),
    theme: {
        extend: {}
    }
}
