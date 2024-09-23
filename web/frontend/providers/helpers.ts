export default {
    capitalize( x: string ) {
        x = x.toLowerCase()
        return `${x.charAt(0).toUpperCase()}${x.slice(1)}`;
    },
}