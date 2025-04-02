(function() {
    function preventDevTools() {
        // Disable right-click
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        }, true);

        // Disable keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                (e.ctrlKey && (e.key === 'U' || e.key.toLowerCase() === 'u'))
            ) {
                e.preventDefault();
                return false;
            }
        }, true);

        // Disable devtools opening through right click
        document.oncontextmenu = function(e) {
            e.preventDefault();
            return false;
        };

        // Additional protection against console opening
        function detectDevTools() {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            if (widthThreshold || heightThreshold) {
                document.body.innerHTML = 'Dev tools detected!';
            }
        }

        setInterval(detectDevTools, 1000);

        // Disable console methods
        const disableConsole = function() {
            const noOp = function(){};
            const methods = [
                'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
                'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
                'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
                'timeStamp', 'trace', 'warn'
            ];
            methods.forEach(function(method) {
                console[method] = noOp;
            });
        };

        // Clear console
        setInterval(function() {
            console.clear();
        }, 1000);

        disableConsole();
    }

    // Run immediately
    preventDevTools();

    // Run again when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preventDevTools);
    }

    // Run when the window loads
    window.addEventListener('load', preventDevTools);
})();
