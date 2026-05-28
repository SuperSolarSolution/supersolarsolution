## Performance Optimization: Caching External Script Promises

When loading external scripts (like Razorpay's checkout script) dynamically, it's beneficial to cache the `Promise` returned by the script loading function if there's a risk of the function being called concurrently or multiple times before the first script tag finishes loading.

Without caching, multiple calls will append multiple identical `<script>` tags to the `document.body` if the global variable (e.g. `window.Razorpay`) hasn't been set yet. Caching the `Promise` reduces the benchmark time for 100 concurrent/successive script load calls from ~24ms to ~4.5ms and prevents duplicate script tag injection, minimizing unnecessary memory allocation and DOM manipulations.

It's also important to clear the cached promise if the script loading fails (`onerror`) so subsequent attempts can retry.
