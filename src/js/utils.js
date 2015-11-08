/**
 * Created by jack on 11/7/15.
 */
/**
 *
 * reference: http://stackoverflow.com/questions/4539740/how-do-you-synchronously-load-a-script-from-another-directory-via-an-ajax-call
 */
module.exports = {

    /**
     * Checks for 'symbol' to be present on the 'window'. Times out after 20 seconds
     *
     * @param symbol attribute to check existence.
     * @param callback callback to be called on success or failure.
     */
    loadScript: function(symbol, callback) {
        var script;
        var expire;

        // Already there?
        if (window[symbol]) {
            setTimeout(function() {
                callback('already loaded');
            }, 0);
        }

        expire = Date.now() + 20000;

        // script = document.createElement('script');
        // script.type = 'text/javascript';
        // script.src = url;
        // document.body.appendChild(script);

        // Start looking for symbol to exist.
        setTimeout(lookForSymbol, 0);

        /**
         * Looks for symbol to exist on the window object.
         */
        function lookForSymbol() {
            if (window[symbol]) {
                callback('success');
            }
            else if (Date.now() > expire) {
                callback('timeout');
            }
            else {
                setTimeout(lookForSymbol, 100);
            }
        }
    },

    isObject: function(arg) {
        return typeof arg === 'object' && arg !== null;
    }
};
