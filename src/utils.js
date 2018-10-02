/**
 * Debounce function.
 * Source: https://gist.github.com/tcase360/3d0e370eca06189f025670d7dd40fe30#file-debounce-js
 *
 * @param  {Function} fn
 * @param  {Integer}  time
 *
 * @return {Function}
 */
export const debounce = (fn, time) => {
    let timeout

    return function() {
        const functionCall = () => fn.apply(this, arguments)

        clearTimeout(timeout)
        timeout = setTimeout(functionCall, time)
    }
}
