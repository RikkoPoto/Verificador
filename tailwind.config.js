tailwind.config = {
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)', surface: 'var(--surface)', ink: 'var(--ink)', mute: 'var(--mute)',
                line: 'var(--line)', neutral: 'var(--neutral)',
                accent: 'var(--accent)', 'accent-ink': 'var(--accent-ink)', 'accent-soft': 'var(--accent-soft)',
                ok: 'var(--ok)', 'ok-soft': 'var(--ok-soft)',
                warn: 'var(--warn)', 'warn-soft': 'var(--warn-soft)',
                bad: 'var(--bad)', 'bad-soft': 'var(--bad-soft)'
            },
            fontFamily: {
                display: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
            }
        }
    }
}