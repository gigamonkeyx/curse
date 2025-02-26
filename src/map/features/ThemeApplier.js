class ThemeApplier {
    constructor(map) {
        this.map = map;
    }

    applyTheme(theme) {
        // Apply the theme to the map
        this.map.setStyle(theme.style);
        this.map.setColorScheme(theme.colorScheme);
    }
}

export default ThemeApplier;
