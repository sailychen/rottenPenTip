(function () {
    var className = 'docsify-theme-switcher';
    var key = 'SELECTED_THEME';
    var themes = [
        { name: 'Vue', title: 'vue', href: '//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css' },
        { name: 'Dark', title: 'dark', href: '//cdn.jsdelivr.net/npm/docsify@4/lib/themes/dark.css' },
        { name: 'Buble', title: 'buble', href: '//cdn.jsdelivr.net/npm/docsify@4/lib/themes/buble.css' },
        { name: 'Pure', title: 'pure', href: '//cdn.jsdelivr.net/npm/docsify@4/lib/themes/pure.css' },
    ];

    var defaultOptions = {
        debug: false,
        fixed: false,
        style: undefined, // e.g., { top: '25px', right: '60px' },
    };
    var selectedTheme = localStorage.getItem(key) || themes[0].title;

    var config = {
        get hasNav() {
            return !!window.$docsify.loadNavbar || window.Docsify.dom.find('nav.app-nav');
        },
        get hasBadge() { return !!window.$docsify.repo; },
        get debug() { return getConfig('debug') === true; },
        get fixed() { return getConfig('fixed') === true; },
        get style() { return getConfig('style'); },
    };

    function getConfig(name) {
        var c = window.$docsify.themeSwitcher;
        if (c && c[name] !== undefined) {
            return c[name];
        }
        return defaultOptions[name];
    }

    function init() {
        if (!window.Docsify.dom.find('.' + className)) {
            var selectHtml = '<select class="dropdown">';
            themes.forEach(function(theme) {
                selectHtml += '<option value="' + theme.title + '"' + (theme.title === selectedTheme ? ' selected' : '') + '>' + theme.name + '</option>';
            });
            selectHtml += '</select>';
    
            var content = window.Docsify.dom.create('div', selectHtml);
            window.Docsify.dom.toggleClass(content, 'add', className);
            if (!config.hasNav) {
                window.Docsify.dom.toggleClass(content, 'add', 'no-nav');
            }
            if (!config.hasBadge) {
                window.Docsify.dom.toggleClass(content, 'add', 'no-badge');
            }
            if (config.fixed) {
                window.Docsify.dom.toggleClass(content, 'add', 'fixed');
            }
            if (config.style) {
                for (var key in config.style) {
                    content.style[key] = config.style[key];
                }
            }
            window.Docsify.dom.before(document.body, content);
    
            var select = content.querySelector('select');
            window.Docsify.dom.on(select, 'change', function () {
                selectedTheme = this.value;
                localStorage.setItem(key, selectedTheme);
                applyTheme();
            });
        }
        applyTheme();
    }

    function applyTheme() {
        // 移除旧的主题样式
        var oldLink = document.getElementById('docsify-theme-link');
        if (oldLink) {
            oldLink.parentNode.removeChild(oldLink);
        }
        // 添加新的主题样式
        var theme = themes.find(function (t) { return t.title === selectedTheme; });
        if (theme) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = theme.href;
            link.id = 'docsify-theme-link';
            document.head.appendChild(link);
        }
    }

    function plugin(hook, vm) {
        hook.mounted(function () {
            init();
        });
        hook.doneEach(function () {
            // 确保在每次页面加载后应用主题
            applyTheme();
        });
    }

    if (!window.$docsify) {
        window.$docsify = {};
    }

    window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins);
})();
